import { Request, Response } from "express";
import { v4 as uuid4 } from "uuid";

const homeCtrl = {
  getID: async (req: Request, res: Response) => {
    try {
      return res.json({
        uuid: uuid4(),
      });
    } catch (err: any) {
      console.error(err);
    }
  },
};

export default homeCtrl;
