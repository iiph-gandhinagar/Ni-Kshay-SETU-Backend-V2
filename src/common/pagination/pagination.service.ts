import { Model, PopulateOptions } from 'mongoose';

export async function paginate(
  model: Model<any>,
  paginationDto: any,
  populateOptions: PopulateOptions[] = [],
  filters: any = {},
) {
  const { page, limit, sortBy, sortOrder } = paginationDto;
  console.log(sortBy, sortOrder, model);
  console.log('filter --->', JSON.stringify(filters, null, 2));
  const query = model
    .find(filters)
    .skip(Number(limit) * (Number(page) - 1))
    .limit(Number(limit))
    .sort({ [sortBy]: sortOrder === 'asc' ? 1 : -1 });

  if (populateOptions.length > 0) {
    populateOptions.forEach((option) => {
      query.populate(option);
    });
  }

  if (filters.primaryCadre) {
    query.where('cadreId.cadreGroup').equals(filters.primaryCadre);
  }

  let data = await query.lean(true).exec();
  console.log(model.modelName === 'UserNotification');
  if (model.modelName === 'UserNotification') {
    if (Array.isArray(data)) {
      data = data.map((item) => {
        delete item.userId; // Remove userId field
        return item;
      });
    }
  }

  if (model.modelName === 'SurveyHistory') {
    data.forEach((history) => {
      if (
        history.questionAnswerDetails &&
        history.questionAnswerDetails.questions
      ) {
        // Loop through each answer in questionAnswer
        history.questionAnswer.forEach((answer) => {
          // Find the question by matching surveyQuestionId with _id in questions array
          const questionDetail = history.questionAnswerDetails.questions.find(
            (question) =>
              question._id.toString() === answer.surveyQuestionId.toString(),
          );
          // If a question detail is found, update the surveyQuestionId with title
          if (questionDetail) {
            answer.surveyQuestionId = questionDetail.title.en; // Update surveyQuestionId with the question title (en)
          }
        });
        delete history.questionAnswerDetails;
      }
    });
  }
  const totalItems = await model.countDocuments(filters);

  const totalPages = Math.ceil(totalItems / limit);

  return {
    status: true,
    message: 'Data retrieved successfully',
    data: {
      list: data,
      totalItems,
      currentPage: Number(page),
      totalPages,
    },
    code: 200,
  };
}
