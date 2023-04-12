/**
 * reference: https://github.com/umijs/dumi/blob/dfc01d08702a4fb59662119f08199786a0c58dc2/src/features/parser.ts#L6
 */

import type { IApi } from 'umi';
import assert from 'assert';
import parse from './parse';

const API_META_PATH = 'dumi/meta/apiParserEnhanced.ts'

export { parse }

export default (api: IApi) => {
  let prevData: Awaited<any>;
  const writeApiMetaFile = (data: typeof prevData) => {
    api.writeTmpFile({
      noPluginDir: true,
      path: API_META_PATH,
      content: `export const apiParserEnhanced = ${JSON.stringify(
        data.components,
        null,
        2,
      )};`,
    });
  };

  api.describe({
    key: 'apiParserEnhanced',
    enableBy: api.EnableBy.config,
    config: {
      schema: (Joi) =>
        Joi.object({
        }),
    },
  });

  // auto-detect default entry file
  api.modifyDefaultConfig((memo) => {
    // TODO: read entry from father config or support configured in config
    assert(
      api.userConfig.resolve?.entryFile,
      '`resolve.entryFile` must be configured when `apiParser` enable',
    );

    return memo;
  });

  // share parser with other plugins via service
  // why use `onCheckPkgJSON` instead of `onStart`?
  // because `onStart` will be called before any commands
  // and `onCheckPkgJson` only be called in dev and build

  // api.onCheckPkgJSON(async () => {
  //   const {
  //     default: AtomAssetsParser,
  //   }: typeof import('@/assetParsers/atom') = require('@/assetParsers/atom');

  //   api.service.atomParser = new AtomAssetsParser({
  //     entryFile: api.config.resolve.entryFile!,
  //     resolveDir: api.cwd,
  //     unpkgHost: api.config.apiParser!.unpkgHost,
  //     resolveFilter: api.config.apiParser!.resolveFilter,
  //     parseOptions: api.config.apiParser!.parseOptions,
  //   });
  // });

  // lazy parse & use watch mode in dev compiling
  api.onDevCompileDone(async ({ isFirstCompile }) => {
    if (isFirstCompile) { // FIXME 不是第一次编译就不执行了
      const data = await parse({
        entryFile: api.config.resolve.entryFile!,
        resolveDir: api.cwd,
      })
      prevData = data
      writeApiMetaFile(data);
    }
  });

  api.onGenerateFiles(async () => {
    if (api.env === 'production') {
      // sync parse in production
      writeApiMetaFile(await parse({
        entryFile: api.config.resolve.entryFile!,
        resolveDir: api.cwd,
      }));
    } else if (prevData) {
      // also write prev data when re-generate files in development
      writeApiMetaFile(prevData);
    }
  });

  // destroy parser worker after build complete

  // api.onBuildComplete({
  //   stage: Infinity,
  //   fn() {
  //     api.service.atomParser.destroyWorker();
  //   },
  // });

  // update unavailable locale text for API component

  // api.modifyTheme((memo) => {
  //   const parserOffKey = 'api.component.unavailable';
  //   const parserOnKey = 'api.component.loading';

  //   // use loading key as normal unavailable key when apiParser enabled
  //   Object.keys(memo.locales).forEach((locale) => {
  //     if (memo.locales[locale][parserOnKey]) {
  //       memo.locales[locale][parserOffKey] = memo.locales[locale][parserOnKey];
  //     }
  //   });

  //   return memo;
  // });
};
