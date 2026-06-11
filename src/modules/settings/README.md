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
      index.tsx
      addedit.tsx
```

## Qoidalar

- List screen: `screens/index.tsx`.
- Add/edit modal yoki form: `screens/addedit.tsx`.
- Role kabi maxsus route-based form bo'lsa aniq nom ishlatiladi:
  `screens/RoleListPage.tsx`, `screens/RoleFormPage.tsx`.
- Screen ichida importlar lokal bo'ladi:
  - `../hooks`
  - `../constants/permissions`
  - `../types/type`
  - `../types/form`
  - `../types/schema`
- `constants/endpoints.ts` va `constants/queryKeys.ts` har module uchun local
  alias beradi.

Hozir local fayllar legacy global qatlamlarga facade bo'lib turibdi. Keyingi
bosqichda hook/service/schema/type kodlarini to'liq shu local papkalarga
ko'chirish mumkin.
