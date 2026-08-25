-- Reduce comunidad de 3 salas por gremio a una sola sala general.
-- No borra mensajes: los reasigna a la sala que se conserva. Lo mismo para
-- bloqueos de usuario y asignaciones de moderador (evitando duplicados si
-- la misma persona ya estaba bloqueada/asignada en más de una sala).

CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$
DECLARE
  kept_id TEXT;
BEGIN
  SELECT id INTO kept_id FROM chat_rooms WHERE category = 'CONSTRUCCION' LIMIT 1;

  IF kept_id IS NOT NULL THEN
    -- Mensajes: se mueven a la sala que se conserva, no se tocan.
    UPDATE chat_messages
    SET "chatRoomId" = kept_id
    WHERE "chatRoomId" IN (
      SELECT id FROM chat_rooms WHERE category IN ('HOTELES_TURISMO', 'PROFESIONALES')
    );

    -- Bloqueos de usuario: se copian a la sala conservada si esa persona
    -- todavía no estaba bloqueada ahí.
    INSERT INTO chat_room_blocks (id, "chatRoomId", "userId", "blockedById", reason, "createdAt")
    SELECT gen_random_uuid()::text, kept_id, "userId", "blockedById", reason, "createdAt"
    FROM chat_room_blocks
    WHERE "chatRoomId" IN (
      SELECT id FROM chat_rooms WHERE category IN ('HOTELES_TURISMO', 'PROFESIONALES')
    )
    ON CONFLICT ("chatRoomId", "userId") DO NOTHING;

    -- Asignaciones de moderador: mismo criterio.
    INSERT INTO moderator_assignments (id, "moderatorId", "chatRoomId")
    SELECT gen_random_uuid()::text, "moderatorId", kept_id
    FROM moderator_assignments
    WHERE "chatRoomId" IN (
      SELECT id FROM chat_rooms WHERE category IN ('HOTELES_TURISMO', 'PROFESIONALES')
    )
    ON CONFLICT ("moderatorId", "chatRoomId") DO NOTHING;

    -- Renombrar la sala conservada: ya no representa solo Construcción.
    UPDATE chat_rooms SET name = 'Comunidad Tica' WHERE id = kept_id;

    -- Borrar las otras dos salas -- lo que quede colgando ahí (bloqueos o
    -- asignaciones no migrados por duplicado) se borra en cascada.
    DELETE FROM chat_rooms WHERE category IN ('HOTELES_TURISMO', 'PROFESIONALES');
  END IF;
END $$;
