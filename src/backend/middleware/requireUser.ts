import { NextFunction, Request, Response } from "express";

const requireUser = (request: Request, response: Response, next: NextFunction) => {
  if (request.session.user === undefined) {
    response.redirect("/");
    return;
  }

  next();
};

export default requireUser;
