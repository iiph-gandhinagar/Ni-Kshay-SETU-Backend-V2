/**
 * Controller responsible for handling user device token operations.
 * 
 * This controller provides endpoints for storing device tokens, running a script
 * to store device tokens, and deleting user accounts permanently. It utilizes
 * guards to ensure that only authenticated users or admins can access specific
 * endpoints.

 * Guards:
 * - `SubscriberAuthGuard`: Ensures that only authenticated subscribers can access
 *   certain endpoints.
 * - `AdminAuthGuard`: Ensures that only authenticated admins can access certain
 *   endpoints.

 */
import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AdminAuthGuard } from 'src/jwt/jwt-admin-auth.guard';
import { SubscriberAuthGuard } from 'src/jwt/jwt-subscriber-auth.guard';
import { StoreDeviceTokenDTO } from 'src/subscriber/dto/store-device-token.dto';
import { UserDeviceTokenService } from './user-device-token.service';

@ApiTags('user-device-token')
@ApiBearerAuth('access-token')
@UsePipes(new ValidationPipe({ transform: true }))
@Controller('user-device-token')
export class UserDeviceTokenController {
  constructor(
    private readonly userDeviceTokenService: UserDeviceTokenService,
  ) {}

  @UseGuards(SubscriberAuthGuard)
  @Post('store-device-token')
  @ApiOperation({ summary: 'Store Device Token' })
  async storeUserDeviceToken(
    @Body() storeDeviceTokenDto: StoreDeviceTokenDTO,
    @Req() request,
  ) {
    const { _id } = request.user; // Assuming userId is stored in the request object by the authentication guard
    return this.userDeviceTokenService.storeUserDeviceToken(
      _id,
      storeDeviceTokenDto,
    );
  }

  @UseGuards(AdminAuthGuard)
  @Get('script-store-device-token')
  @ApiOperation({ summary: 'Store Device Token' })
  async scriptDeviceToken() {
    return this.userDeviceTokenService.scriptUserDeviceToken();
  }

  @UseGuards(SubscriberAuthGuard)
  @Post('delete-account')
  @ApiOperation({ summary: 'Delete Account permanently' })
  async deleteAccount(@Req() request, @Body() reason: string) {
    const { _id } = request.user;
    return this.userDeviceTokenService.deleteAccount(_id, reason);
  }
}
