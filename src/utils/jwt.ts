import {validatorUtils, zod} from "@nafkhanzam/common-utils";
import jsonwebtoken from "jsonwebtoken";

export class JWTUtils<
  A extends object,
  B extends zod.ZodTypeDef,
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

  toToken = (obj: zod.infer<T>, opts?: {expiresIn: string | number}) => {
    return jsonwebtoken.sign(obj, this.key, {
      ...(opts?.expiresIn ? {expiresIn: opts.expiresIn} : {}),
    });
  };
}
export const accessTokenJWTValidator = zod
  .object({
    serial: zod.string(),
    role: zod.enum(["TEST", "TEST2"]).optional(),
  })
  .nonstrict();

new JWTUtils(accessTokenJWTValidator, "test");
