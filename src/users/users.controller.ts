import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthGuard } from './auth/auth.guard';
import {
  LoggedInUser,
  type RequestWithUser,
} from './decorators/user.decorator';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @UseGuards(AuthGuard)
  findAll(@Req() req: RequestWithUser) {
    const user = req.user;
    console.log('logged in user', user);
    return this.usersService.findAll();
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  findOne(@LoggedInUser('id') user, @Param('id') id: string) {
    console.log('logged in user', user);
    return this.usersService.findOne(id);
  }

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  //TODO: Assignment : Implement @CustomBody() decorator mimicing the functionality of @Body() decorator
  // And use it in the new post method below
  // Read more about custom decorators here: https://docs.nestjs.com/custom-decorators
  // Hint: You can refer to the implementation of @LoggedInUser() decorator above
  // Also refer to the official docs link above to understand how to extract body from request object

  @Post('/login')
  login(
    @Body('email') email: string,
    @Body('password') password: string,
  ): Promise<{ token: string }> {
    return this.usersService.login(email, password);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
