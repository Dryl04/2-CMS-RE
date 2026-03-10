import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  const mockAuthService = {
    login: jest.fn(),
    register: jest.fn(),
    getProfile: jest.fn(),
    changePassword: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: mockAuthService }],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('login', () => {
    it('should call authService.login and return result', async () => {
      const loginDto = { email: 'test@example.com', password: 'password123' };
      const expectedResult = {
        access_token: 'jwt-token',
        user: { id: 'user-1', email: 'test@example.com' },
      };
      mockAuthService.login.mockResolvedValue(expectedResult);

      const result = await controller.login(loginDto);

      expect(authService.login).toHaveBeenCalledWith(loginDto);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('register', () => {
    it('should call authService.register and return result', async () => {
      const registerDto = {
        email: 'new@example.com',
        password: 'password123',
        fullName: 'New User',
      };
      const expectedResult = {
        access_token: 'jwt-token',
        user: { id: 'user-2', email: 'new@example.com' },
      };
      mockAuthService.register.mockResolvedValue(expectedResult);

      const result = await controller.register(registerDto);

      expect(authService.register).toHaveBeenCalledWith(registerDto);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('getProfile', () => {
    it('should call authService.getProfile with userId from request', async () => {
      const req = { user: { userId: 'user-1' } };
      const expectedResult = {
        id: 'user-1',
        email: 'test@example.com',
        fullName: 'Test User',
      };
      mockAuthService.getProfile.mockResolvedValue(expectedResult);

      const result = await controller.getProfile(req);

      expect(authService.getProfile).toHaveBeenCalledWith('user-1');
      expect(result).toEqual(expectedResult);
    });
  });

  describe('changePassword', () => {
    it('should call authService.changePassword with correct arguments', async () => {
      const req = { user: { userId: 'user-1' } };
      const body = { oldPassword: 'oldPass', newPassword: 'newPass' };
      const expectedResult = { message: 'Password changed successfully' };
      mockAuthService.changePassword.mockResolvedValue(expectedResult);

      const result = await controller.changePassword(req, body);

      expect(authService.changePassword).toHaveBeenCalledWith(
        'user-1',
        'oldPass',
        'newPass',
      );
      expect(result).toEqual(expectedResult);
    });
  });
});
