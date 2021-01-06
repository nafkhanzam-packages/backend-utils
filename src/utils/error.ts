import {ErrorStatus} from "@nafkhanzam/common-utils";
import {ApolloError} from "apollo-server-express";
import _ from "lodash";

const createGQLError = (
  status: ErrorStatus,
  msg?: string,
  extensions?: Record<string, any>,
) =>
  new ApolloError(
    msg ?? _.startCase(_.toLower(status.replace("_", " "))),
    status,
    extensions,
  );

export const errorUtils = {createGQLError};
