import {
  ErrorDetail,
  ErrorExtensionType,
  ErrorStatus,
  zod,
} from "@nafkhanzam/common-utils";
import {GraphQLError, GraphQLFormattedError} from "graphql";
import {ApolloError} from "apollo-server-express";
import _ from "lodash";

export const gqlerr = {
  createGQLError: (
    status: ErrorStatus,
    msg?: string,
    extensions?: Record<string, any>,
  ) =>
    new ApolloError(
      msg ?? _.startCase(_.toLower(status.replace("_", " "))),
      status,
      extensions,
    ),
  formatZodError: (error: zod.ZodError): string => {
    return error.issues
      .map(({code, path, message}) => `[${code}] ${path.join("/")}: ${message}`)
      .join("; ");
  },
  checkPrismaCodes: (err: unknown, codes: string[]) => {
    const parseResult = zod.object({code: zod.string()}).safeParse(err);
    if (parseResult.success) {
      const {code} = parseResult.data;
      return codes.includes(code);
    }
    return false;
  },
  isPrismaNotFoundError: (err: unknown) => {
    const isPrismaCodeNotFound = gqlerr.checkPrismaCodes(err, [
      "P2025",
      "P2018",
      "P2003",
    ]);
    const isPrismaNotFoundError =
      err instanceof Error && err.name === "NotFoundError";
    return isPrismaCodeNotFound || isPrismaNotFoundError;
  },
  prismaNotFoundHandler:
    (msg?: string, status?: ErrorStatus) => (err: unknown) => {
      if (gqlerr.isPrismaNotFoundError(err)) {
        throw gqlerr.createGQLError(status ?? ErrorStatus.NOT_FOUND, msg);
      }
      throw err;
    },
  isPrismaAlreadyExistsError: (err: unknown) => {
    let isPrismaCodeAlreadyExists = gqlerr.checkPrismaCodes(err, ["P2002"]);
    return isPrismaCodeAlreadyExists;
  },
};

export const gqlErrorExtensionFormatters: Record<
  string,
  (err: unknown) => ErrorExtensionType | undefined
> = {
  zodValidation: (err) => {
    if (err instanceof zod.ZodError) {
      return {
        code: ErrorStatus.BAD_REQUEST,
        message: "Input argument(s) are invalid",
        detail: ErrorDetail.ZOD_VALIDATION,
        issues: err.issues,
      };
    }
  },
  prismaNotFound: (err) => {
    if (gqlerr.isPrismaNotFoundError(err)) {
      return {
        code: ErrorStatus.NOT_FOUND,
      };
    }
  },
  prismaAlreadyExist: (err) => {
    if (gqlerr.isPrismaAlreadyExistsError(err)) {
      return {
        code: ErrorStatus.ALREADY_EXISTS,
      };
    }
  },
};

export const formatGQLError = (rawErr: GraphQLError): GraphQLFormattedError => {
  const orig = rawErr.originalError;
  if (orig instanceof GraphQLError || orig instanceof ApolloError) {
    return rawErr;
  }
  let extensions: ErrorExtensionType | undefined = undefined;
  for (const tryGetExtension of Object.values(gqlErrorExtensionFormatters)) {
    extensions = tryGetExtension(orig);
    if (extensions) {
      break;
    }
  }
  if (!extensions) {
    extensions = {
      code: ErrorStatus.INTERNAL_SERVER_ERROR,
    };
  }
  const message =
    extensions.message ?? extensions.code ?? ErrorStatus.INTERNAL_SERVER_ERROR;
  return {
    ...rawErr,
    message,
    extensions: extensions ?? rawErr.extensions,
  };
};
