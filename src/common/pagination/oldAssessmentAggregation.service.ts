import mongoose, { Model } from 'mongoose';

export async function OldAssessmentAggregate(
  model: Model<any>,
  paginationDto: any,
  filters: any = {},
) {
  const {
    page,
    limit,
    sortBy,
    sortOrder,
    country,
    stateIds,
    districtIds,
    userCadreId,
    blockIds,
    healthFacilityIds,
  } = paginationDto;
  // Start the aggregation pipeline
  const aggregationPipeline: any[] = [
    {
      $lookup: {
        from: 'subscribers',
        localField: 'userId',
        foreignField: '_id',
        as: 'userId',
      },
    },
    { $unwind: '$userId' }, // Convert userId array to an object
    {
      $lookup: {
        from: 'countries',
        localField: 'userId.countryId',
        foreignField: '_id',
        as: 'userId.country',
        pipeline: country
          ? [{ $match: { _id: new mongoose.Types.ObjectId(country) } }]
          : [],
      },
    },
    {
      $lookup: {
        from: 'states',
        localField: 'userId.stateId',
        foreignField: '_id',
        as: 'userId.state',
        pipeline:
          stateIds && stateIds.length > 0
            ? [
                {
                  $match: {
                    _id: {
                      $in: stateIds.map((s) => new mongoose.Types.ObjectId(s)),
                    },
                  },
                },
              ]
            : [],
      },
    },
    {
      $lookup: {
        from: 'cadres',
        localField: 'userId.cadreId',
        foreignField: '_id',
        as: 'userId.cadre',
        pipeline:
          userCadreId && userCadreId.length > 0
            ? [
                {
                  $match: {
                    _id: {
                      $in: userCadreId.map(
                        (s) => new mongoose.Types.ObjectId(s),
                      ),
                    },
                  },
                },
              ]
            : [],
      },
    },
    {
      $lookup: {
        from: 'districts',
        localField: 'userId.districtId',
        foreignField: '_id',
        as: 'userId.district',
        pipeline:
          districtIds && districtIds.length > 0
            ? [
                {
                  $match: {
                    _id: {
                      $in: districtIds.map(
                        (s) => new mongoose.Types.ObjectId(s),
                      ),
                    },
                  },
                },
              ]
            : [],
      },
    },
    {
      $lookup: {
        from: 'blocks',
        localField: 'userId.blockId',
        foreignField: '_id',
        as: 'userId.block',
        pipeline:
          blockIds && blockIds.length > 0
            ? [
                {
                  $match: {
                    _id: {
                      $in: blockIds.map((s) => new mongoose.Types.ObjectId(s)),
                    },
                  },
                },
              ]
            : [],
      },
    },
    {
      $lookup: {
        from: 'healthfacilities',
        localField: 'userId.healthFacilityId',
        foreignField: '_id',
        as: 'userId.healthFacility',
        pipeline:
          healthFacilityIds && healthFacilityIds.length > 0
            ? [
                {
                  $match: {
                    _id: {
                      $in: healthFacilityIds.map(
                        (s) => new mongoose.Types.ObjectId(s),
                      ),
                    },
                  },
                },
              ]
            : [],
      },
    },
    { $match: filters },
    {
      $project: {
        userId: '$userId',
        assessmentId: '$assessmentId',
        assessmentTitle: '$title',
        totalMarks: 1,
        totalTime: 1,
        obtainedMarks: 1,
        attempted: 1,
        rightAnswer: 1,
        wrongAnswer: 1,
        skipped: 1,
        createdAt: {
          $dateToString: {
            format: '%Y-%m-%d %H:%M:%S', // Custom date format
            date: { $toDate: '$createdAt' }, // Convert 'createdAt' to a valid date
            timezone: 'Asia/Kolkata', // Convert to IST (Indian Standard Time)
          },
        },
        isCalculated: 1,
        percentage: {
          $cond: {
            if: { $gt: ['$totalMarks', 0] }, // Avoid division by zero
            then: {
              $multiply: [{ $divide: ['$obtainedMarks', '$totalMarks'] }, 100],
            },
            else: 0, // Default to 0% if totalMarks is 0
          },
        },
        userData: {
          name: 1,
          phoneNo: 1,
          email: 1,
          country: { $arrayElemAt: ['$userId.country.title', 0] },
          state: { $arrayElemAt: ['$userId.state.title', 0] },
          cadreType: { $arrayElemAt: ['$userId.cadre.cadreType', 0] },
          cadre: { $arrayElemAt: ['$userId.cadre.title', 0] },
          district: { $arrayElemAt: ['$userId.district.title', 0] },
          block: { $arrayElemAt: ['$userId.block.title', 0] },
          healthFacility: {
            $arrayElemAt: ['$userId.healthFacility.title', 0],
          },
        },
      },
    },
    { $sort: { [sortBy]: sortOrder === 'asc' ? 1 : -1 } },
    { $skip: Number(limit) * (Number(page) - 1) },
    { $limit: Number(limit) },
  ];
  const nonNullChecks: any = {};
  if (country) nonNullChecks['userData.country'] = { $ne: null };
  if (stateIds) nonNullChecks['userData.state'] = { $ne: null };
  if (userCadreId) nonNullChecks['userData.cadre'] = { $ne: null };
  if (districtIds) nonNullChecks['userData.district'] = { $ne: null };
  // Add the conditional non-null check match stage if there are any conditions
  if (Object.keys(nonNullChecks).length > 0) {
    aggregationPipeline.push({ $match: nonNullChecks });
  }
  const totalCount = await model.countDocuments(filters).exec();
  // Sorting, Pagination, and Projection stages
  // Execute the aggregation pipeline
  const result = await model.aggregate(aggregationPipeline).exec();
  const totalPages = Math.ceil(totalCount / limit);
  const data = result;
  return {
    status: true,
    message: 'Data retrieved successfully',
    data: {
      list: data,
      totalItems: totalCount,
      currentPage: Number(page),
      totalPages,
    },
    code: 200,
  };
}
