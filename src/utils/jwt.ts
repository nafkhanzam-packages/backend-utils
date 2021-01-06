import {validatorUtils} from "@nafkhanzam/common-utils";
import jsonwebtoken from "jsonwebtoken";
import zod, {ZodTypeDef} from "zod";

export class JWTUtils<
  A extends object,
  B extends ZodTypeDef,
  T extends zod.ZodType<A, B>
> {
  constructor(private validator: T, private key: string) {}

  decryptToken = (token: string): zod.infer<T> => {
    return this.toJWTObject(jsonwebtoken.verify(token, this.key));
  };

  toJWTObject = (jwtObj: string | object | null): zod.infer<T> => {
    if (typeof jwtObj === "string") {
      return this.decryptToken(jwtObj);
    }
    return validatorUtils.validate(this.validator, jwtObj);
  };

  headerToJwtObj = (headerValue?: string) => {
    let jwt: zod.infer<T> | null = null;
    const token = headerValue?.replace("Bearer ", "");
    if (token) {
      try {
        jwt = this.toJWTObject(token);
      } catch (error) {}
    }
    return jwt;
  };

  toToken = (obj: zod.infer<T>, opts?: {expiresIn?: string | number}) => {
    return jsonwebtoken.sign(obj, this.key, {expiresIn: opts?.expiresIn});
  };
}
