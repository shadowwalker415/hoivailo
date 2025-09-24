import { Router, IRouter, Request, Response } from "express";

const servicesRouter: IRouter = Router();

servicesRouter.get("/kotihoito", (_req: Request, res: Response) => {
  res.status(200).render("kotiHoito");
});

servicesRouter.get("/yrityssiivous", (_req: Request, res: Response) => {
  res.status(200).render("yrityssiivous");
});

servicesRouter.get("/kotisairaanhoito", (_req: Request, res: Response) => {
  res.status(200).render("kotisairaanhoito");
});

servicesRouter.get("/kotisiivous", (_req: Request, res: Response) => {
  res.status(200).render("kotisiivous");
});

servicesRouter.get("/lastenhoito", (_req: Request, res: Response) => {
  res.status(200).render("lastenHoito");
});

servicesRouter.get("/henkilokohtainenapu", (_req: Request, res: Response) => {
  res.status(200).render("henkilokohtainenApu");
});

servicesRouter.get("/omaishoitajansijainen", (_req: Request, res: Response) => {
  res.status(200).render("omaishoitajanSijainen");
});

export default servicesRouter;
