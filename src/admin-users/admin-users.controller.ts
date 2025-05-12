/**
 * @module AdminUsersController
 *
 * This controller handles all operations related to admin users, including authentication,
 * password management, user creation, retrieval, updating, and deletion. It provides endpoints
 * for admin user login, password reset, token verification, and CRUD operations on admin user data.
 *
 * Features:
 * - Admin user login with validation and error handling.
 * - Password reset functionality including token verification.
 * - Creation of new admin users with authentication and authorization.
 * - Retrieval of admin user profiles and lists with query parameters for filtering and pagination.
 * - Update and deletion of admin user details with proper validation and error handling.
 */
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { ValidationError } from 'class-validator';
import { message } from 'src/common/assets/message.asset';
import { PaginationDto } from 'src/common/pagination/pagination.dto';
import { AdminAuthGuard } from 'src/jwt/jwt-admin-auth.guard';
import { TokenVerificationDto } from 'src/temporary-token/dto/token-verification.dto';
import { AdminUsersService } from './admin-users.service';
import { CreateAdminUserDto } from './dto/create-admin-user.dto';
import { LoginDto } from './dto/login.dto';
import { UpdateAdminUserDto } from './dto/update-admin-user.dto';

@ApiTags('admin-users')
@UsePipes(new ValidationPipe({ transform: true }))
@Controller('admin-users')
export class AdminUsersController {
  constructor(private readonly adminUsersService: AdminUsersService) {}

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    try {
      const result = await this.adminUsersService.login(
        loginDto.email,
        loginDto.password,
      );
      if (result === message.auth.INVALID_CREDENTIALS) {
        throw new HttpException(
          { message: message.auth.INVALID_CREDENTIALS, status: false },
          HttpStatus.BAD_REQUEST,
        );
      }
      return {
        message: message.auth.LOGIN_SUCCESS,
        data: result,
        status: true,
        code: 200,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error; // Re-throw HttpException to preserve the status code
      } else {
        // For other unexpected errors
        throw new HttpException(
          { message: 'Internal server error', error: error.message },
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }

  @ApiOperation({ summary: 'Forgot Password' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: {
          type: 'string',
          example: 'example@domain.com',
        },
      },
    },
  })
  @Post('forgot-password')
  forgotEmail(@Body() body: { email: string }) {
    return this.adminUsersService.forgotEmail(body.email);
  }

  @ApiOperation({ summary: 'Verified Token and changed password' })
  @Post('changed-password')
  verifiedToken(@Body() tokenVerificationDto: TokenVerificationDto) {
    return this.adminUsersService.verifiedToken(tokenVerificationDto);
  }

  @ApiOperation({ summary: 'Create Admin User' })
  @ApiBearerAuth('access-token')
  @UseGuards(AdminAuthGuard)
  @Post()
  create(@Body() createAdminUserDto: CreateAdminUserDto) {
    return this.adminUsersService.create(createAdminUserDto);
  }

  @ApiOperation({ summary: 'Get All Admin Users List!' })
  @ApiBearerAuth('access-token')
  @UseGuards(AdminAuthGuard)
  @Get()
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'firstName', required: false })
  @ApiQuery({ name: 'lastName', required: false })
  @ApiQuery({ name: 'email', required: false })
  @ApiQuery({ name: 'stateId', required: false, type: [String] })
  @ApiQuery({ name: 'districtId', required: false, type: [String] })
  @ApiQuery({ name: 'search', required: false, type: String })
  findAll(@Query() paginationDto: PaginationDto) {
    return this.adminUsersService.findAll(paginationDto);
  }

  @ApiOperation({ summary: 'Get Admin User Details!' })
  @ApiBearerAuth('access-token')
  @UseGuards(AdminAuthGuard)
  @Get('/profile')
  getAdminUserProfile(@Req() request) {
    const { _id, name, role } = request.user;
    console.log('admin user details --->', _id, name, role);
    return this.adminUsersService.getUserProfile(_id);
  }

  @ApiOperation({ summary: 'Get Admin User Details!' })
  @ApiBearerAuth('access-token')
  @UseGuards(AdminAuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.adminUsersService.findOne(id);
  }

  @ApiOperation({ summary: 'Update Admin User Details!' })
  @ApiBearerAuth('access-token')
  @UseGuards(AdminAuthGuard)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateAdminUserDto: UpdateAdminUserDto,
  ) {
    try {
      return this.adminUsersService.update(id, updateAdminUserDto);
    } catch (error) {
      if (Array.isArray(error) && error[0] instanceof ValidationError) {
        throw new HttpException(
          {
            message: 'Validation failed',
            errors: error,
          },
          HttpStatus.BAD_REQUEST,
        );
      } else {
        throw new HttpException(
          { message: 'Internal server error', error: error.message },
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }

  @ApiOperation({ summary: 'Delete Admin User Details!' })
  @ApiBearerAuth('access-token')
  @UseGuards(AdminAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    try {
      return this.adminUsersService.remove(id);
    } catch (error) {
      if (Array.isArray(error) && error[0] instanceof ValidationError) {
        throw new HttpException(
          {
            message: 'Validation failed',
            errors: error,
          },
          HttpStatus.BAD_REQUEST,
        );
      } else {
        throw new HttpException(
          { message: 'Internal server error', error: error.message },
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }
}
