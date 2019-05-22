import * as express from "express";

/**
 * GET /
 * Home page.
 */
export let index: express.RequestHandler = (req: express.Request, res: express.Response) => {
  res.render("home", {
    title: "Home"
  });
};
