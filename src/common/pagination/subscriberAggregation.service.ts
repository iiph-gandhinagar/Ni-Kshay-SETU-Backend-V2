import mongoose, { Model } from 'mongoose';

export async function SubscriberAggregation(
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
    // Convert userId array to an object
    {
      $lookup: {
        from: 'countries',
        localField: 'countryId',
        foreignField: '_id',
        as: 'country',
        pipeline: country
          ? [{ $match: { _id: new mongoose.Types.ObjectId(country) } }]
          : [],
      },
    },
    {
      $lookup: {
        from: 'states',
        localField: 'stateId',
        foreignField: '_id',
        as: 'state',
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
        localField: 'cadreId',
        foreignField: '_id',
        as: 'cadre',
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
    { $unwind: { path: '$cadre', preserveNullAndEmptyArrays: true } }, // Unwind cadreId first
    {
      $lookup: {
        from: 'primarycadres',
        localField: 'cadre.cadreGroup',
        foreignField: '_id',
        as: 'cadreGroup',
      },
    },
    { $unwind: { path: '$cadreGroup', preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: 'districts',
        localField: 'districtId',
        foreignField: '_id',
        as: 'district',
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
        localField: 'blockId',
        foreignField: '_id',
        as: 'block',
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
        localField: 'healthFacilityId',
        foreignField: '_id',
        as: 'healthFacility',
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
        name: 1,
        phoneNo: 1,
        email: 1,
        isOldUser: 1,
        isVerified: 1,
        status: 1,
        forgotOtpTime: 1,
        country: {
          $ifNull: [{ $arrayElemAt: ['$country.title', 0] }, ''],
        },
        state: {
          $ifNull: [{ $arrayElemAt: ['$state.title', 0] }, ''],
        },
        cadre: { $ifNull: ['$cadre.title', ''] },
        cadreGroup: { $ifNull: ['$cadreGroup.title', ''] },
        cadreType: { $ifNull: ['$cadre.cadreType', ''] },
        district: {
          $ifNull: [{ $arrayElemAt: ['$district.title', 0] }, ''],
        },
        block: {
          $ifNull: [{ $arrayElemAt: ['$block.title', 0] }, ''],
        },
        healthFacility: {
          $ifNull: [
            { $arrayElemAt: ['$healthFacility.healthFacilityCode', 0] },
            '',
          ],
        },
        createdAt: {
          $dateToString: {
            format: '%Y-%m-%d %H:%M:%S', // Custom date format
            date: { $toDate: '$createdAt' }, // Convert 'createdAt' to a valid date
            timezone: 'Asia/Kolkata',
          },
        },
      },
    },
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
  console.log('sortBy and sortOrder', sortBy, sortOrder);
  // Sorting, Pagination, and Projection stages
  aggregationPipeline.push(
    {
      $facet: {
        totalItems: [{ $count: 'count' }],
        data: [
          { $sort: { [sortBy]: sortOrder === 'asc' ? 1 : -1 } },
          { $skip: Number(limit) * (Number(page) - 1) },
          { $limit: limit },
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
