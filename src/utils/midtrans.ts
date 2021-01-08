import {validatorUtils, zod} from "@nafkhanzam/common-utils";
import axios from "axios";

const createPaymentResponseValidator = zod
  .object({
    token: zod.string(),
    redirect_url: zod.string(),
  })
  .nonstrict();

export class MidtransUtils {
  private authHeaderValue: string;

  constructor(private transactionUrl: string, midtransServerKey: string) {
    this.authHeaderValue = `Basic ${Buffer.from(
      `${midtransServerKey}:`,
    ).toString("base64")}`;
  }

  createPayment = async (args: {
    orderId: string;
    grossAmount: number;
    notificationUrl?: string;
  }) => {
    try {
      const result = await axios.post(
        this.transactionUrl,
        {
          transaction_details: {
            order_id: args.orderId,
            gross_amount: args.grossAmount,
          },
          credit_card: {
            secure: false,
          },
        },
        {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: this.authHeaderValue,
            "X-Override-Notification": args.notificationUrl,
          },
        },
      );
      const {token, redirect_url} = validatorUtils.validate(
        createPaymentResponseValidator,
        result.data,
      );
      return {
        token,
        redirectUrl: redirect_url,
      };
    } catch (e) {
      throw new Error(`Error while making midtrans payment! [${e}]`);
    }
  };
}
