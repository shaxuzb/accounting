# Settings Page Architecture

Har bir settings bo'limi o'z ichida hook, constants, types va screenlarni
saqlaydi. Developer bitta bo'lim ustida ishlaganda shu katalogdan chiqmasligi
kerak.

```txt
src/modules/settings/pages/
  users/
    hooks/
      useCreateUsers.ts
      useGetDetailUsers.ts
      useGetListUsers.ts
      useUpdateUsers.ts
      index.ts
    constants/
      endpoints.ts
      permissions.ts
      queryKeys.ts
    types/
      form.ts
      schema.ts
      type.ts
    screens/
      UserListPage.tsx
      UserAddEditPage.tsx
```

## Qoidalar

- List screen: `screens/{Entity}ListPage.tsx`.
- Add/edit modal yoki form: `screens/{Entity}AddEditPage.tsx`.
- File nomi va default component nomi bir xil bo'ladi:
  `UserListPage.tsx` -> `UserListPage`.
- Screen ichida importlar lokal bo'ladi:
  - `../hooks`
  - `../constants/permissions`
  - `../types/type`
  - `../types/form`
  - `../types/schema`
- `constants/endpoints.ts` va `constants/queryKeys.ts` har module uchun local
  alias beradi.
