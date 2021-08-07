import {validatorUtils, zod} from "@nafkhanzam/common-utils";
import jsonwebtoken from "jsonwebtoken";

export class JWTUtils<V extends zod.AnyZodObject> {
  constructor(private validator: V, private key: string) {}

  decryptToken = (token: string): zod.infer<V> => {
    return this.toJWTObject(jsonwebtoken.verify(token, this.key));
  };

  toJWTObject = (jwtObj: string | object | null): zod.infer<V> => {
    if (typeof jwtObj === "string") {
      return this.decryptToken(jwtObj);
    }
    return validatorUtils.validate(this.validator, jwtObj);
  };

  headerToJwtObj = (headerValue?: string) => {
    let jwt: zod.infer<V> | null = null;
    const token = headerValue?.replace("Bearer ", "");
    if (token) {
      try {
        jwt = this.toJWTObject(token);
      } catch (error) {}
    }
    return jwt;
  };

  toToken = (obj: zod.infer<V>, opts?: {expiresIn: string | number}) => {
    return jsonwebtoken.sign(obj, this.key, {
      ...(opts?.expiresIn ? {expiresIn: opts.expiresIn} : {}),
    });
  };
}
