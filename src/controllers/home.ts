import * as express from "express";

/**
 * GET /
 * Home page.
 */
export const index: express.RequestHandler = (req: express.Request, res: express.Response) => {
    res.render("home", {
        title: "Home"
    });
};
