import { Router, IRouter, Request, Response } from "express";

const homeRouter: IRouter = Router();

homeRouter.get("/", (_req, res) => {
  res.status(200).render("home");
});

homeRouter.get("/ura", (_req: Request, res: Response) => {
  res.status(200).render("ura");
});

homeRouter.get("/palvelumme", (_req: Request, res: Response) => {
  res.status(200).render("palvelumme");
});

homeRouter.get("/faq", (_req: Request, res: Response) => {
  res.status(200).render("faq");
});

homeRouter.get("/meista", (_req: Request, res: Response) => {
  res.status(200).render("aboutUs");
});

export default homeRouter;
