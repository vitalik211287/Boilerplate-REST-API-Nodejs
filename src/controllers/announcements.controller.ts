import type { Request, Response } from "express";
import prisma from "../../prisma/client.ts";

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

  const announcement = await prisma.announcement.create({
    data: {
      ...req.body,
      userId,
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

  const updatedAnnouncement = await prisma.announcement.update({
    where: { id },
    data: req.body,

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

  await prisma.announcement.delete({
    where: { id },
  });

  res.status(204).end();
};
