// Auto-generated username: "admin-" + 6 alphanumeric (no 0/O, 1/I/L)
export const generateAdminUsername = (): string => {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  let result = 'admin-';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// Password: 8+ chars, 1 upper, 1 lower, 1 number, 1 special
export const generateTempPassword = (): string => {
  const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lower = 'abcdefghijklmnopqrstuvwxyz';
  const num = '0123456789';
  const special = '!@#$%^&*_-+=';
  const all = upper + lower + num + special;

  let pwd = '';
  pwd += upper[Math.floor(Math.random() * upper.length)];
  pwd += lower[Math.floor(Math.random() * lower.length)];
  pwd += num[Math.floor(Math.random() * num.length)];
  pwd += special[Math.floor(Math.random() * special.length)];

  for (let i = 0; i < 8; i++) {
    pwd += all[Math.floor(Math.random() * all.length)];
  }
  return pwd.split('').sort(() => 0.5 - Math.random()).join('');
};