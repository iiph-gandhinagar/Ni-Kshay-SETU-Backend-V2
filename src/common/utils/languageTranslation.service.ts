export class LanguageTranslation {
  async getTranslatedFields(doc, lang) {
    const title =
      doc.title[lang] !== undefined && doc.title[lang] !== null
        ? { [lang]: doc.title[lang] }
        : { en: doc.title['en'] };
    let description;
    if (doc.description) {
      description =
        doc.description[lang] !== undefined && doc.description[lang] !== null
          ? { [lang]: doc.description[lang] }
          : { en: doc.description['en'] };
    }

    return {
      title,
      description,
    };
  }

  async getAppConfigTranslatedFields(doc, lang) {
    const value =
      doc.value[lang] !== undefined && doc.value[lang] !== null
        ? doc.value[lang]
        : doc.value['en'];
    return {
      value,
    };
  }

  async getMasterCmsTranslatedFields(doc, lang) {
    const description =
      doc.description[lang] !== undefined && doc.description[lang] !== null
        ? { [lang]: doc.description[lang] }
        : { en: doc.description['en'] };
    return {
      description,
    };
  }

  async getSymptomTranslatedFields(doc, lang) {
    const title =
      doc.title[lang] !== undefined && doc.title[lang] !== null
        ? { [lang]: doc.title[lang] }
        : { en: doc.title['en'] };
    return {
      title,
    };
  }
}
