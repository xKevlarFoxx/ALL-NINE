import speakeasy from 'speakeasy';
import qrcode from 'qrcode';

export class TwoFactorAuthService {
  /**
   * Generate a 2FA secret for a user.
   * @returns The secret and a QR code URL.
   */
  static async generateSecret(): Promise<{ secret: string; qrCodeUrl: string }> {
    const secret = speakeasy.generateSecret({ length: 20 });
    const qrCodeUrl = await qrcode.toDataURL(secret.otpauth_url || '');
    return { secret: secret.base32, qrCodeUrl };
  }

  /**
   * Verify a 2FA token.
   * @param secret - The user's 2FA secret.
   * @param token - The token to verify.
   * @returns Whether the token is valid.
   */
  static verifyToken(secret: string, token: string): boolean {
    return speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token,
    });
  }
}