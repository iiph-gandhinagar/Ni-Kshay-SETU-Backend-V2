import mongoose from 'mongoose';
import { PaginationDto } from '../pagination/pagination.dto';

export class FilterService {
  async filter(filter: PaginationDto) {
    const {
      title,
      name,
      location,
      category,
      categories,
      key,
      value,
      variable,
      stateId,
      districtId,
      cadreTypes,
      blockId,
      subject,
      message,
      email,
      feature,
      author,
      source,
      healthFacilityId,
      cadreId,
      phoneNo,
      healthFacilityCode,
      symptomTitle,
      cadreGroup,
      nodeType,
      search,
      query,
      queryRaisedRole,
      queryRaisedInstitute,
      queryRespondedInstitute,
      raisedBy,
      respondedBy,
      type,
      instituteId,
      subscriber,
      role,
      institute,
      question,
      option1,
      option2,
      option3,
      option4,
      correctAnswer,
      createdBy,
      assessmentType,
      timeToComplete,
      countryId,
      assessmentId,
      response,
      obtainedMarks,
      totalMarks,
      isVisible,
      status,
      transferredInstitute,
      qLevel,
      language,
      action,
      platform,
      causerId,
      subTitle,
      questions,
      firstName,
      lastName,
      userId,
      state,
      cadre,
      district,
      country,
      countries,
      cadres,
      states,
      districts,
      blocks,
      href,
      moduleName,
      active,
      illness,
      queryId,
      diagnosis,
      chiefComplaint,
      isAllCadre,
      cadreIds,
      adminStateId,
      adminDistrictId,
      stateCountry,
      block,
      healthFacility,
      fromDate,
      toDate,
      stateIds,
      districtIds,
      blockIds,
      healthFacilityIds,
      userCadreId,
      userEmail,
      appVersion,
      currentPlatform,
      userPhoneNo,
      userIds,
      primaryCadre,
      types,
      assessmentTitle,
      userCadreType,
      usersId,
      surveyId,
      regimen,
      prescription,
      notes,
      userIdFilter,
    } = filter;
    const queries: any = {};
    const andConditions: any[] = [];
    const orConditions: any[] = [];
    if (title) {
      andConditions.push({ title: new RegExp(title, 'i') });
    }

    if (symptomTitle) {
      andConditions.push({ 'title.en': new RegExp(symptomTitle, 'i') });
    }

    if (types) {
      andConditions.push({ type: new RegExp(types, 'i') });
    }

    if (isVisible) {
      andConditions.push({ isVisible: isVisible });
    }

    if (action) {
      andConditions.push({ action: new RegExp(action, 'i') });
    }

    if (platform) {
      andConditions.push({ platform: new RegExp(platform, 'i') });
    }

    if (subTitle) {
      andConditions.push({ subTitle: new RegExp(subTitle, 'i') });
    }

    if (href) {
      andConditions.push({ href: new RegExp(href, 'i') });
    }

    if (appVersion) {
      andConditions.push({ appVersion: new RegExp(appVersion, 'i') });
    }

    if (currentPlatform) {
      andConditions.push({ currentPlatform: new RegExp(currentPlatform, 'i') });
    }

    if (active) {
      andConditions.push({ active: active });
    }

    if (isAllCadre) {
      andConditions.push({ isAllCadre: isAllCadre });
    }

    if (healthFacilityCode) {
      andConditions.push({
        healthFacilityCode: new RegExp(healthFacilityCode, 'i'),
      });
    }

    if (obtainedMarks) {
      andConditions.push({ obtainedMarks: obtainedMarks });
    }

    if (totalMarks) {
      andConditions.push({ totalMarks: totalMarks });
    }

    if (response) {
      andConditions.push({ response: new RegExp(response, 'i') });
    }

    if (name) {
      andConditions.push({ name: new RegExp(name, 'i') });
    }

    if (primaryCadre) {
      andConditions.push({
        'cadre.cadreGroup': {
          $in: primaryCadre.map((t) => new mongoose.Types.ObjectId(t)),
        },
      });
    }

    if (firstName) {
      andConditions.push({ firstName: new RegExp(firstName, 'i') });
    }

    if (lastName) {
      andConditions.push({ lastName: new RegExp(lastName, 'i') });
    }

    if (diagnosis) {
      andConditions.push({ diagnosis: new RegExp(diagnosis, 'i') });
    }

    if (regimen) {
      andConditions.push({ regimen: new RegExp(regimen, 'i') });
    }

    if (prescription) {
      andConditions.push({ prescription: new RegExp(prescription, 'i') });
    }

    if (notes) {
      andConditions.push({ notes: new RegExp(notes, 'i') });
    }

    if (chiefComplaint) {
      andConditions.push({ chiefComplaint: new RegExp(chiefComplaint, 'i') });
    }

    if (queryId) {
      andConditions.push({ queryId: new RegExp(queryId, 'i') });
    }

    if (illness) {
      andConditions.push({ illness: new RegExp(illness, 'i') });
    }

    if (nodeType) {
      andConditions.push({ nodeType: new RegExp(nodeType, 'i') });
    }

    if (category) {
      andConditions.push({ category: new RegExp(category, 'i') });
    }

    if (categories) {
      andConditions.push({
        category: { $in: categories.map((t) => new RegExp(t, 'i')) },
      });
    }

    if (location) {
      andConditions.push({ location: new RegExp(location, 'i') });
    }

    if (key) {
      andConditions.push({ key: new RegExp(key, 'i') });
    }

    if (value) {
      andConditions.push({ value: new RegExp(value, 'i') });
    }

    if (variable) {
      andConditions.push({ variable: new RegExp(variable, 'i') });
    }

    if (query) {
      andConditions.push({ query: new RegExp(query, 'i') });
    }

    if (option1) {
      andConditions.push({ 'option1.en': new RegExp('option1.en', 'i') });
    }

    if (option2) {
      andConditions.push({ 'option2.en': new RegExp('option2.en', 'i') });
    }

    if (option3) {
      andConditions.push({ 'option3.en': new RegExp('option3.en', 'i') });
    }

    if (option4) {
      andConditions.push({ 'option4.en': new RegExp('option4.en', 'i') });
    }

    if (correctAnswer) {
      andConditions.push({ correctAnswer: new RegExp(correctAnswer, 'i') });
    }
    if (status) {
      andConditions.push({ status: new RegExp(`^${status}$`, 'i') });
    }

    if (language) {
      andConditions.push({ language: new RegExp(language, 'i') });
    }

    if (qLevel) {
      andConditions.push({ qLevel: new RegExp(qLevel, 'i') });
    }

    if (subscriber) {
      andConditions.push({
        subscriber: new mongoose.Types.ObjectId(subscriber),
      });
    }

    if (surveyId) {
      andConditions.push({
        surveyId: {
          $in: surveyId.map((t) => new mongoose.Types.ObjectId(t)),
        },
      });
    }

    if (causerId) {
      andConditions.push({
        causerId: new mongoose.Types.ObjectId(causerId),
      });
    }

    if (userId) {
      andConditions.push({
        userId: new mongoose.Types.ObjectId(userId),
      });
    }

    if (usersId) {
      andConditions.push({
        userId: {
          $in: usersId.map((t) => new mongoose.Types.ObjectId(t)),
        },
      });
    }

    if (userIds) {
      andConditions.push({
        'userId._id': {
          $in: userIds.map((t) => new mongoose.Types.ObjectId(t)),
        },
      });
    }

    if (userIdFilter) {
      /* this filter for subscriber _id filter */
      andConditions.push({
        _id: userIdFilter.map((t) => new mongoose.Types.ObjectId(t)),
      });
    }

    if (state) {
      andConditions.push({
        'userId.stateId': new mongoose.Types.ObjectId(state),
      });
    }

    if (stateIds) {
      andConditions.push({
        'userId.stateId': {
          $in: stateIds.map((t) => new mongoose.Types.ObjectId(t)),
        },
      });
    }

    if (districtIds) {
      andConditions.push({
        'userId.districtId': {
          $in: districtIds.map((t) => new mongoose.Types.ObjectId(t)),
        },
      });
    }

    if (adminStateId) {
      orConditions.push({
        'userId.stateId': new mongoose.Types.ObjectId(adminStateId),
      });
    }

    if (adminDistrictId) {
      orConditions.push({
        'userId.districtId': new mongoose.Types.ObjectId(adminDistrictId),
      });
    }

    if (cadre) {
      andConditions.push({
        'userId.cadreId': new mongoose.Types.ObjectId(cadre),
      });
    }

    if (userCadreId) {
      andConditions.push({
        'userId.cadreId': {
          $in: userCadreId.map((t) => new mongoose.Types.ObjectId(t)),
        },
      });
    }

    if (district) {
      andConditions.push({
        'userId.districtId': new mongoose.Types.ObjectId(district),
      });
    }

    if (country) {
      andConditions.push({
        'userId.countryId': new mongoose.Types.ObjectId(country),
      });
    }

    if (block) {
      andConditions.push({
        'userId.blockId': new mongoose.Types.ObjectId(block),
      });
    }

    if (healthFacility) {
      andConditions.push({
        'userId.healthFacilityId': new mongoose.Types.ObjectId(healthFacility),
      });
    }

    if (healthFacilityIds) {
      andConditions.push({
        'userId.healthFacilityId': {
          $in: healthFacilityIds.map((t) => new mongoose.Types.ObjectId(t)),
        },
      });
    }

    if (states) {
      andConditions.push({
        stateId: new mongoose.Types.ObjectId(states),
      });
    }

    if (blocks) {
      andConditions.push({
        blockId: new mongoose.Types.ObjectId(blocks),
      });
    }

    if (cadres) {
      andConditions.push({
        cadreId: new mongoose.Types.ObjectId(cadres),
      });
    }

    if (districts) {
      andConditions.push({
        districtId: new mongoose.Types.ObjectId(districts),
      });
    }

    if (countries) {
      andConditions.push({
        countryId: new mongoose.Types.ObjectId(countries),
      });
    }

    if (states) {
      andConditions.push({
        stateId: new mongoose.Types.ObjectId(states),
      });
    }

    if (blocks) {
      andConditions.push({
        blockId: new mongoose.Types.ObjectId(blocks),
      });
    }

    if (cadres) {
      andConditions.push({
        cadreId: new mongoose.Types.ObjectId(cadres),
      });
    }

    if (districts) {
      andConditions.push({
        districtId: new mongoose.Types.ObjectId(districts),
      });
    }

    if (countries) {
      andConditions.push({
        countryId: new mongoose.Types.ObjectId(countries),
      });
    }

    if (stateCountry) {
      andConditions.push({
        countryId: new mongoose.Types.ObjectId(stateCountry),
      });
    }

    if (createdBy) {
      andConditions.push({
        createdBy: new mongoose.Types.ObjectId(createdBy),
      });
    }

    if (role) {
      andConditions.push({
        role: new mongoose.Types.ObjectId(role),
      });
    }

    if (institute) {
      andConditions.push({
        institute: new mongoose.Types.ObjectId(institute),
      });
    }

    if (countryId) {
      andConditions.push({
        countryId: new mongoose.Types.ObjectId(countryId),
      });
    }

    if (stateId && stateId.length > 0) {
      console.log('inside stateId condition--->');
      andConditions.push({
        stateId: { $in: stateId.map((t) => new mongoose.Types.ObjectId(t)) },
      });
    }

    if (assessmentId && assessmentId.length > 0) {
      andConditions.push({
        assessmentId: {
          $in: assessmentId.map((t) => new mongoose.Types.ObjectId(t)),
        },
      });
    }

    if (districtId && districtId.length > 0) {
      andConditions.push({
        districtId: {
          $in: districtId.map((t) => new mongoose.Types.ObjectId(t)),
        },
      });
    }
    if (cadreTypes && cadreTypes.length > 0) {
      andConditions.push({
        cadreType: { $in: cadreTypes.map((t) => new RegExp(t, 'i')) }, // Use $in to match any regex in the array
      });
    }

    if (userCadreType && userCadreType.length > 0) {
      andConditions.push({
        'userId.cadreType': {
          $in: userCadreType.map((t) => new RegExp(t, 'i')),
        }, // Use $in to match any regex in the array
      });
    }

    if (blockId && blockId.length > 0) {
      andConditions.push({
        blockId: {
          $in: blockId.map((t) => new mongoose.Types.ObjectId(t)),
        },
      });
    }

    if (blockIds && blockIds.length > 0) {
      andConditions.push({
        'userId.blockId': {
          $in: blockIds.map((t) => new mongoose.Types.ObjectId(t)),
        },
      });
    }

    if (fromDate || toDate) {
      const dateCondition: any = {}; // Temporary object for date conditions

      if (fromDate) {
        dateCondition['$gte'] = new Date(fromDate);
      }
      if (toDate) {
        const endDate = new Date(toDate);
        endDate.setHours(23, 59, 59, 999); // Set to end of the day
        dateCondition['$lte'] = endDate;
      }

      // Push createdAt condition into andConditions array
      andConditions.push({ createdAt: dateCondition });
    }

    if (healthFacilityId && healthFacilityId.length > 0) {
      andConditions.push({
        healthFacilityId: {
          $in: healthFacilityId.map((t) => new mongoose.Types.ObjectId(t)),
        },
      });
    }

    if (cadreId && cadreId.length > 0) {
      andConditions.push({
        cadreId: { $in: cadreId.map((t) => new mongoose.Types.ObjectId(t)) },
      });
    }

    if (cadreGroup && cadreGroup.length > 0) {
      andConditions.push({
        cadreGroup: {
          $in: cadreGroup.map((t) => new mongoose.Types.ObjectId(t)),
        },
      });
    }

    if (queryRaisedRole && queryRaisedRole.length > 0) {
      andConditions.push({
        queryRaisedRole: new mongoose.Types.ObjectId(queryRaisedRole),
      });
    }

    if (queryRaisedInstitute && queryRaisedInstitute.length > 0) {
      andConditions.push({
        queryRaisedInstitute: new mongoose.Types.ObjectId(queryRaisedInstitute),
      });
    }

    if (cadreIds) {
      orConditions.push(
        {
          cadreId: {
            $in: cadreIds.map((t) => new mongoose.Types.ObjectId(t)),
          },
        },
        { isAllCadre: true },
      );
    }

    if (raisedBy && raisedBy.length > 0) {
      orConditions.push({
        raisedBy: new mongoose.Types.ObjectId(raisedBy),
      });
    }

    if (respondedBy && respondedBy.length > 0) {
      orConditions.push({
        respondedBy: new mongoose.Types.ObjectId(respondedBy),
      });
    }

    if (transferredInstitute && transferredInstitute.length > 0) {
      andConditions.push({
        payload: {
          $elemMatch: {
            queryRespondedInstitute: new mongoose.Types.ObjectId(
              transferredInstitute,
            ),
            $or: [{ status: 'In Progress' }, { status: 'Query Transfer' }],
          },
        },
        $or: [
          { payload: { $elemMatch: { status: 'Query Transfer' } } },
          { status: { $eq: 'Query Transfer' } },
        ],
      });
    }

    if (type === 'Open' && instituteId !== '') {
      andConditions.push({
        queryRespondedInstitute: instituteId,
        response: null,
      });
    } else if (type === 'Closed' && instituteId !== '') {
      andConditions.push({
        queryRespondedInstitute: instituteId,
        response: { $ne: null },
      });
    } else if (type === 'All') {
      orConditions.push({
        queryRespondedInstitute: instituteId,
        response: null,
        status: 'In Progress', // open queries
      });
      orConditions.push({
        respondedBy: new mongoose.Types.ObjectId(respondedBy),
        response: { $ne: null }, // closed Queries(My Responded queries)
      });
      orConditions.push({
        raisedBy: new mongoose.Types.ObjectId(raisedBy),
        response: { $ne: null }, // my queries
      });
      orConditions.push({
        payload: {
          $elemMatch: {
            queryRespondedInstitute: new mongoose.Types.ObjectId(
              transferredInstitute,
            ),
            $or: [{ status: 'In Progress' }, { status: 'Query Transfer' }],
          },
        },
        $or: [
          { payload: { $elemMatch: { status: 'Query Transfer' } } },
          { status: { $eq: 'Query Transfer' } },
        ],
      });
    }

    if (queryRespondedInstitute) {
      andConditions.push({
        queryRespondedInstitute: new mongoose.Types.ObjectId(
          queryRespondedInstitute,
        ),
        response: null,
      });
    }

    if (subject) {
      andConditions.push({ subject: new RegExp(subject, 'i') });
    }

    if (assessmentType) {
      andConditions.push({ assessmentType: new RegExp(assessmentType, 'i') });
    }

    if (assessmentTitle) {
      andConditions.push({ assessmentTitle: new RegExp(assessmentTitle, 'i') });
    }

    if (timeToComplete) {
      andConditions.push({ timeToComplete: timeToComplete });
    }

    if (message) {
      andConditions.push({ message: new RegExp(message, 'i') });
    }

    if (moduleName) {
      andConditions.push({ moduleName: new RegExp(moduleName, 'i') });
    }

    if (email) {
      andConditions.push({ email: new RegExp(email, 'i') });
    }

    if (userEmail) {
      andConditions.push({ 'userId.email': new RegExp(userEmail, 'i') });
    }

    if (feature) {
      andConditions.push({ feature: new RegExp(feature, 'i') });
    }

    if (question) {
      andConditions.push({ question: new RegExp(question, 'i') });
    }

    if (questions) {
      andConditions.push({ 'questions.en': new RegExp('questions.en', 'i') });
    }

    if (author) {
      andConditions.push({ author: new RegExp(author, 'i') });
    }

    if (source) {
      andConditions.push({ source: new RegExp(source, 'i') });
    }

    if (phoneNo) {
      andConditions.push({ phoneNo: new RegExp(phoneNo, 'i') });
    }

    if (userPhoneNo) {
      andConditions.push({ 'userId.phoneNo': new RegExp(userPhoneNo, 'i') });
    }

    if (search) {
      const searchFields = [
        'title',
        'title.en',
        'description',
        'description.en',
        'key',
        'value',
        'value.en',
        'phoneNo',
        'source',
        'author',
        'email',
        'feature',
        'feature.en',
        'bugFix',
        'bugFix.en',
        'subject',
        'message',
        'name',
        'name.en',
        'location',
        'variable',
        'variable.en',
        'category',
        'feedback_question',
        'healthFacilityCode',
        'question',
        'question.en',
        'subTitle',
        'subTitle.en',
        'moduleName',
        'symptomTitle',
        'symptomTitle.en',
        'option1.en',
        'option2.en',
        'option3.en',
        'option4.en',
        'correctAnswer',
        'level',
        'content',
        'badge',
        'minSpent',
        'subModuleUsageCount',
        'appOpenedCount',
        'chatbotUsageCount',
        'totalTask',
        'levelId',
        'badgeId',
        'typeOfMaterials',
        'appVersion',
        'currentPlatform',
        'action',
      ];

      const orConditions = searchFields.map((field) => ({
        [field]: { $regex: search, $options: 'i' },
      }));

      andConditions.push({ $or: orConditions });
    }
    console.log('anCondition-->', orConditions);
    if (andConditions.length > 0) {
      queries.$and = andConditions;
    }
    if (orConditions.length > 0) {
      queries.$or = orConditions;
    }
    return queries;
  }

  async generatePopulateOptions(
    populateFields: { path: string; select: string; searchField?: string }[],
    search?: string,
  ): Promise<mongoose.PopulateOptions[]> {
    return populateFields.map((field) => {
      const { path, select, searchField } = field;
      // Define match condition if search is provided
      const match = searchField
        ? { [searchField]: { $regex: search, $options: 'i' } }
        : {};

      // Return PopulateOptions with or without match condition
      return {
        path,
        select,
        ...(search && searchField ? { match } : {}),
      };
    });
  }
}
