declare module "listr" {
  class Listr<Context> {
    constructor(tasks: Array<Listr.ITask<Context>>, options?: Listr.IRendererOptions);

    public run(context?: Context): Promise<Context>;
    public add(task: Listr.ITask<Context>): Listr<Context>;
    public setRenderer(renderer: Listr.IRenderer<Context>): void;
    public render(): void;
  }

  namespace Listr {
    export type TaskExecutorFn<Context> = (context: Context) => Promise<any>;
    export type TaskSkipFn = () => Promise<boolean>;

    export interface ITask<Context> {
      title: string;
      task: TaskExecutorFn<Context>;
      skip?: TaskSkipFn;
      options?: IRendererOptions;
      concurrent?: number | boolean;
      exitOnError?: boolean;
      renderer?: IRenderer<Context>;
    }

    // tslint:disable-next-line:max-classes-per-file
    export abstract class IRenderer<Context> {
      constructor(tasks: Array<ITask<Context>>, options: IRendererOptions);
      public abstract nonTTY(): boolean;
      public abstract render(): void;
      public abstract end(error: Error): void;
    }

    export interface IRendererOptions {
      [x: string]: any;
    }
  }

  export = Listr;
}
