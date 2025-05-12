import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AdminUserDocument } from 'src/admin-users/entities/admin-user.entity';

export class AdminService {
  constructor(
    @InjectModel('AdminUser') private adminUserModel: Model<AdminUserDocument>,
  ) {}
  async adminRoleFilter(userId: string, query: any, type: string) {
    console.log('This Action returns admin role wise state,district filters');
    const adminUser = await this.adminUserModel
      .findById(userId)
      .select(
        'name role state isAllState roleType countryId district isAllDistrict',
      );

    const hasStateId = query.stateId;
    const hasDistrictId = query.districtId;
    if (hasStateId || hasDistrictId) {
      // If stateId or districtId is already present, return query merged with additionalConditions
      return { ...query };
    }
    if (adminUser.roleType === 'country_level') {
      return { ...query };
    } else if (adminUser.roleType === 'state_level') {
      if (adminUser.isAllState && adminUser.isAllState === true) {
        return { ...query };
      } else {
        if (type === 'district') {
          query.stateId = { $in: adminUser.state };
          query._id = { $in: adminUser.district };
        } else if (type === 'state') {
          query._id = { $in: adminUser.state };
        } else if (
          type === 'block' ||
          type === 'health-facility' ||
          type == 'assessment' ||
          type === 'subscriber' ||
          type === 'inquiry' ||
          type === 'subscriber-activity'
        ) {
          query.$or = [
            { stateId: { $in: adminUser.state } },
            { districtId: { $in: adminUser.district } },
          ];
        } else if (type === 'resource-material') {
          query.createdBy = adminUser._id;
          query.stateId = { $in: adminUser.state };
        } else if (type === 'user-assessment') {
          query.userId = {
            ...query.userId, // Preserve existing fields if any
            stateId: { $in: adminUser.state },
            districtId: { $in: adminUser.district },
          };
        } else {
          query.districtId = { $in: adminUser.district };
        }
      }
    } else if (adminUser.roleType === 'district_level') {
      if (!(adminUser.isAllDistrict && adminUser.isAllDistrict === true)) {
        if (type === 'district') {
          query.stateId = { $in: adminUser.state };
          query._id = { $in: adminUser.district };
        } else if (type === 'state') {
          query._id = { $in: adminUser.state };
        } else if (
          type === 'block' ||
          type === 'health-facility' ||
          type == 'assessment' ||
          type === 'subscriber' ||
          type === 'inquiry' ||
          type === 'subscriber-activity'
        ) {
          query.$or = [
            { stateId: { $in: adminUser.state } },
            { districtId: { $in: adminUser.district } },
          ];
        } else if (type === 'resource-material') {
          query.createdBy = adminUser._id;
          query.stateId = { $in: adminUser.state };
        } else if (type === 'user-assessment') {
          query.userId = {
            ...query.userId, // Preserve existing fields if any
            stateId: { $in: adminUser.state },
            districtId: { $in: adminUser.district },
          };
        } else {
          query.districtId = { $in: adminUser.district };
        }
      } else {
        return { ...query };
      }
    } else {
      throw new Error(
        'Invalid role or insufficient permissions to filter the query.',
      );
    }
    console.log('query--->', JSON.stringify(query));
    // Merge with additional conditions
    return { ...query };
  }
}
