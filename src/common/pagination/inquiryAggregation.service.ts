import mongoose, { Model } from 'mongoose';

export async function InquiryAggregate(
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
  // console.log('filters-->', JSON.stringify(filters));
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
        message: 1,
        subject: 1,
        email: 1,
        createdAt: {
          $dateToString: {
            format: '%Y-%m-%d %H:%M:%S', // Custom date format
            date: { $toDate: '$createdAt' }, // Convert 'createdAt' to a valid date
            timezone: 'Asia/Kolkata', // Convert to IST (Indian Standard Time)
          },
        },
        userData: {
          name: 1,
          phoneNo: 1,
          email: 1,
          country: { $arrayElemAt: ['$userId.country.title', 0] },
          state: { $arrayElemAt: ['$userId.state.title', 0] },
          cadre: { $arrayElemAt: ['$userId.cadre.title', 0] },
          district: { $arrayElemAt: ['$userId.district.title', 0] },
          block: { $arrayElemAt: ['$userId.block.title', 0] },
        },
      },
    },
  ];
  const nonNullChecks: any = {};
  if (country) nonNullChecks['userData.country'] = { $ne: null };
  if (stateIds) nonNullChecks['userData.state'] = { $ne: null };
  if (userCadreId) nonNullChecks['userData.cadre'] = { $ne: null };
  if (districtIds) nonNullChecks['userData.district'] = { $ne: null };
  if (blockIds) nonNullChecks['userData.block'] = { $ne: null };
  // console.log('not null checks--->', nonNullChecks);
  // Add the conditional non-null check match stage if there are any conditions
  if (Object.keys(nonNullChecks).length > 0) {
    aggregationPipeline.push({ $match: nonNullChecks });
  }

  // Sorting, Pagination, and Projection stages
  aggregationPipeline.push(
    {
      $facet: {
        totalItems: [{ $count: 'count' }],
        data: [
          { $skip: Number(limit) * (Number(page) - 1) },
          { $limit: limit },
          { $sort: { [sortBy]: sortOrder === 'asc' ? 1 : -1 } },
        ],
      },
    },
    {
      $project: {
        totalItems: { $arrayElemAt: ['$totalItems.count', 0] },
        data: 1,
      },
    },
  );
  //   console.log('aggregation -->', JSON.stringify(aggregationPipeline));
  // Execute the aggregation pipeline
  const result = await model.aggregate(aggregationPipeline).exec();
  console.log(
    'data totalItems-->',
    result[0].data.length,
    result[0]?.totalItems || 0,
  );
  const totalItems = result[0]?.totalItems || 0;

  const totalPages = Math.ceil(totalItems / limit);
  const data = result[0]?.data || [];
  //   return data;
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
