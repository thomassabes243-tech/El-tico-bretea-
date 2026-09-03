-- Alta de 2 moderadores a pedido del usuario, asignados a la única sala de
-- Comunidad existente. Si el correo ya tenía cuenta (no admin), solo se le
-- cambia el role a MODERATOR sin tocar su contraseña; si ya era ADMIN, no
-- se toca (protección para no perder acceso de administrador por error).
DO $$
DECLARE
  v_user_id TEXT;
  v_moderator_id TEXT;
  v_room_id TEXT;
BEGIN
  -- thomassabes243@gmail.com (contraseña generada: [REDACTADA])
  INSERT INTO "users" ("id", "email", "passwordHash", "role", "updatedAt")
  VALUES (gen_random_uuid()::text, 'thomassabes243@gmail.com', '$2b$10$5tmaO567.9sBvieY9iwjX.kt.Bh4TxHvX8SI69CGre200o6b6rr4q', 'MODERATOR', now())
  ON CONFLICT (email) DO UPDATE SET role = 'MODERATOR', "updatedAt" = now()
    WHERE "users".role <> 'ADMIN';

  SELECT id INTO v_user_id FROM "users" WHERE email = 'thomassabes243@gmail.com';

  INSERT INTO "moderators" ("id", "userId") VALUES (gen_random_uuid()::text, v_user_id)
  ON CONFLICT ("userId") DO NOTHING;
  SELECT id INTO v_moderator_id FROM "moderators" WHERE "userId" = v_user_id;

  SELECT id INTO v_room_id FROM "chat_rooms" ORDER BY "createdAt" ASC LIMIT 1;
  IF v_room_id IS NOT NULL AND v_moderator_id IS NOT NULL THEN
    INSERT INTO "moderator_assignments" ("id", "moderatorId", "chatRoomId")
    VALUES (gen_random_uuid()::text, v_moderator_id, v_room_id)
    ON CONFLICT ("moderatorId", "chatRoomId") DO NOTHING;
  END IF;
END $$;

DO $$
DECLARE
  v_user_id TEXT;
  v_moderator_id TEXT;
  v_room_id TEXT;
BEGIN
  -- tg321920@gmail.com (contraseña generada: [REDACTADA])
  INSERT INTO "users" ("id", "email", "passwordHash", "role", "updatedAt")
  VALUES (gen_random_uuid()::text, 'tg321920@gmail.com', '$2b$10$T59hMAByYZIxNz9v/Jr.nObjPXQOIiR3I11WRIU4BVHjInxa3EIWa', 'MODERATOR', now())
  ON CONFLICT (email) DO UPDATE SET role = 'MODERATOR', "updatedAt" = now()
    WHERE "users".role <> 'ADMIN';

  SELECT id INTO v_user_id FROM "users" WHERE email = 'tg321920@gmail.com';

  INSERT INTO "moderators" ("id", "userId") VALUES (gen_random_uuid()::text, v_user_id)
  ON CONFLICT ("userId") DO NOTHING;
  SELECT id INTO v_moderator_id FROM "moderators" WHERE "userId" = v_user_id;

  SELECT id INTO v_room_id FROM "chat_rooms" ORDER BY "createdAt" ASC LIMIT 1;
  IF v_room_id IS NOT NULL AND v_moderator_id IS NOT NULL THEN
    INSERT INTO "moderator_assignments" ("id", "moderatorId", "chatRoomId")
    VALUES (gen_random_uuid()::text, v_moderator_id, v_room_id)
    ON CONFLICT ("moderatorId", "chatRoomId") DO NOTHING;
  END IF;
END $$;
