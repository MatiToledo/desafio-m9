//Recibe un email y un código y valida que sean los correctos.
//En el caso de que sean correctos devuelve un token e invalida el código.

import * as yup from "yup";

import type { NextApiRequest, NextApiResponse } from "next";

import { Auth } from "models/auth";
import { generate } from "lib/jwt";
import methods from "micro-method-router";
import { validateBody } from "lib/middlewares";

let bodySchema = yup
  .object()
  .shape({
    email: yup.string().required(),
    code: yup.number().required(),
  })
  .noUnknown(true)
  .strict();

async function postHandler(req: NextApiRequest, res: NextApiResponse) {
  const auth = await Auth.findEmailAndCode(req.body.email, req.body.code);

  if (!auth) {
    res.status(401).send("Email or code incorrect");
  }

  console.log(auth);

  const expires = auth.isCodeExpired();

  if (expires) {
    res.status(400).send("expired code");
  }

  var token = generate({ userId: auth.data.userId });
  await auth.invalidateCode();
  res.send({ token });
}

const handler = methods({
  post: postHandler,
});

export default validateBody(bodySchema, handler);
