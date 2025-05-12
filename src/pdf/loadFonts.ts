import * as path from 'path';

export const fonts = {
  Courier: {
    normal: 'Courier',
    bold: 'Courier-Bold',
    italics: 'Courier-Oblique',
    bolditalics: 'Courier-BoldOblique',
  },
  Helvetica: {
    normal: 'Helvetica',
    bold: 'Helvetica-Bold',
    italics: 'Helvetica-Oblique',
    bolditalics: 'Helvetica-BoldOblique',
  },
  Times: {
    normal: 'Times-Roman',
    bold: 'Times-Bold',
    italics: 'Times-Italic',
    bolditalics: 'Times-BoldItalic',
  },
  Symbol: {
    normal: 'Symbol',
  },
  ZapfDingbats: {
    normal: 'ZapfDingbats',
  },
  Roboto: {
    normal: path.join(__dirname, '..', '..', 'fonts', 'Roboto-Regular.ttf'),
    bold: path.join(__dirname, '..', '..', 'fonts', 'Roboto-Bold.ttf'),
    italics: path.join(__dirname, '..', '..', 'fonts', 'Roboto-Italic.ttf'),
    bolditalics: path.join(
      __dirname,
      '..',
      '..',
      'fonts',
      'Roboto-BoldItalic.ttf',
    ),
  },
  Allura: {
    normal: path.join(__dirname, '..', '..', 'fonts', 'Allura-Regular.ttf'),
    bold: path.join(__dirname, '..', '..', 'fonts', 'Allura-Regular.ttf'),
    italics: path.join(__dirname, '..', '..', 'fonts', 'Allura-Regular.ttf'),
    bolditalics: path.join(
      __dirname,
      '..',
      '..',
      'fonts',
      'Allura-Regular.ttf',
    ),
  },
};
