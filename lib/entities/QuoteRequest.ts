import { TradeType } from '@uniswap/sdk-core';
import { BigNumber } from 'ethers';

import {
  ClassicConfig,
  ClassicConfigJSON,
  DutchLimitConfig,
  DutchLimitConfigJSON,
  RoutingConfig,
  RoutingConfigJSON,
  RoutingType,
} from './routing';

export interface QuoteRequestData {
  tokenInChainId: number;
  tokenOutChainId: number;
  requestId: string;
  tokenIn: string;
  tokenOut: string;
  amount: BigNumber;
  tradeType: TradeType;
  slippageTolerance?: string;
  configs: RoutingConfig[];
}

export interface QuoteRequestDataJSON extends Omit<QuoteRequestData, 'tradeType' | 'amount' | 'configs'> {
  tradeType: string;
  amount: string;
  configs: RoutingConfigJSON[];
}

export class QuoteRequest implements QuoteRequestData {
  public static fromRequestBody(body: QuoteRequestDataJSON): QuoteRequest {
    return new QuoteRequest(
      body.tokenInChainId,
      body.tokenOutChainId,
      body.requestId,
      body.tokenIn,
      body.tokenOut,
      BigNumber.from(body.amount),
      TradeType[body.tradeType as keyof typeof TradeType],
      this.parseConfig(body.configs),
      body.slippageTolerance
    );
  }

  constructor(
    public readonly tokenInChainId: number,
    public readonly tokenOutChainId: number,
    public readonly requestId: string,
    public readonly tokenIn: string,
    public readonly tokenOut: string,
    public readonly amount: BigNumber,
    public readonly tradeType: TradeType,
    public readonly configs: RoutingConfig[],
    public readonly slippageTolerance?: string
  ) {}

  // ignores routing types that are not supported
  private static parseConfig(configs: RoutingConfigJSON[]): RoutingConfig[] {
    return configs.flatMap((config) => {
      if (config.routingType == RoutingType.CLASSIC) {
        return ClassicConfig.fromRequestBody(config as ClassicConfigJSON);
      } else if (config.routingType == RoutingType.DUTCH_LIMIT) {
        return DutchLimitConfig.fromRequestBody(config as DutchLimitConfigJSON);
      }
      return [];
    });
  }

  public toJSON() {
    return {
      tokenInChainId: this.tokenInChainId,
      tokenOutChainId: this.tokenOutChainId,
      requestId: this.requestId,
      tokenIn: this.tokenIn,
      tokenOut: this.tokenOut,
      tradeType: TradeType[this.tradeType],
      amount: this.amount.toString(),
      configs: this.configs.map((config) => config.toJSON()),
      slippageTolerance: this.slippageTolerance,
    };
  }
}