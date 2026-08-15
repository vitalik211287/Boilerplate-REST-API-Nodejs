import type { Request, Response } from "express";
import prisma from "../../prisma/client.ts";
import fs from "node:fs/promises";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const getAllAnnouncements = async (req: Request, res: Response) => {
  const page = Number(req.query.page) || 1;
  const search = String(req.query.search || "");
  const sort = String(req.query.sort || "newest");

  const perPage = 10;
  const skip = (page - 1) * perPage;

  const where = search
    ? {
        title: {
          contains: search,
          mode: "insensitive" as const,
        },
      }
    : {};

  const orderBy =
    sort === "oldest"
      ? { createdAt: "asc" as const }
      : { createdAt: "desc" as const };

  const [announcements, total] = await Promise.all([
    prisma.announcement.findMany({
      where,
      skip,
      take: perPage,
      orderBy,
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
            name: true,
          },
        },
      },
    }),

    prisma.announcement.count({
      where,
    }),
  ]);

  res.status(200).json({
    data: announcements,
    pagination: {
      total,
      page,
      totalPages: Math.ceil(total / perPage),
      perPage,
    },
  });
};

export const getAnnouncementById = async (req: Request, res: Response) => {
  const id = Number(req.params.id);

  const announcement = await prisma.announcement.findUnique({
    where: { id },

    include: {
      user: {
        select: {
          id: true,
          username: true,
          email: true,
          name: true,
        },
      },
    },
  });

  if (!announcement) {
    return res.status(404).json({
      error: "Announcement not found",
    });
  }

  res.status(200).json(announcement);
};

export const createAnnouncement = async (req: Request, res: Response) => {
  const userId = Number(req.user?.sub);

  let imageUrl: string | undefined;
  let imagePublicId: string | undefined;

  if (req.file) {
    try {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "announcements",
      });

      imageUrl = result.secure_url;
      imagePublicId = result.public_id;
    } finally {
      await fs.unlink(req.file.path).catch(() => {});
    }
  }

  const announcement = await prisma.announcement.create({
    data: {
      ...req.body,
      userId,
      imageUrl,
      imagePublicId,
    },

    include: {
      user: {
        select: {
          id: true,
          username: true,
          email: true,
          name: true,
        },
      },
    },
  });

  res.status(201).json(announcement);
};

export const updateAnnouncement = async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const userId = Number(req.user?.sub);

  const announcement = await prisma.announcement.findUnique({
    where: { id },
  });

  if (!announcement) {
    return res.status(404).json({
      error: "Announcement not found",
    });
  }

  if (announcement.userId !== userId) {
    return res.status(403).json({
      error: "Access denied",
    });
  }

  let imageUrl: string | undefined;
  let imagePublicId: string | undefined;
  if (req.file) {
    try {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "announcements",
      });

      imageUrl = result.secure_url;
      imagePublicId = result.public_id;

      if (announcement.imagePublicId) {
        try {
          await cloudinary.uploader.destroy(announcement.imagePublicId);
        } catch (error) {
          return res.status(500).json({
            error: "Failed to delete image",
          });
        }
      }
    } finally {
      await fs.unlink(req.file.path).catch(() => {});
    }
  }

  const updatedAnnouncement = await prisma.announcement.update({
    where: { id },
    data: {
      ...req.body,
      imageUrl,
      imagePublicId,
    },

    include: {
      user: {
        select: {
          id: true,
          username: true,
          email: true,
          name: true,
        },
      },
    },
  });

  res.status(200).json(updatedAnnouncement);
};

export const deleteAnnouncement = async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const userId = Number(req.user?.sub);

  const announcement = await prisma.announcement.findUnique({
    where: { id },
  });

  if (!announcement) {
    return res.status(404).json({
      error: "Announcement not found",
    });
  }

  if (announcement.userId !== userId) {
    return res.status(403).json({
      error: "Access denied",
    });
  }

  if (announcement.imagePublicId) {
    try {
      await cloudinary.uploader.destroy(announcement.imagePublicId);
    } catch (error) {
      return res.status(500).json({
        error: "Failed to delete image",
      });
    }
  }

  await prisma.announcement.delete({
    where: { id },
  });

  res.status(204).end();
};
