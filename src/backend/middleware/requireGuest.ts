import { NextFunction, Request, Response } from "express";

const requireGuest = (request: Request, response: Response, next: NextFunction) => {
  if (request.session.user !== undefined) {
    response.redirect("/lobby");
    return;
  }

  next();
};

export default requireGuest;
