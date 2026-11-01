-- ============================================
-- CRM EKAM - Pruebas de las reglas de la base de datos (Sprint 02)
-- Se puede ejecutar en el SQL Editor: no deja ningún dato.
--
-- Simula a cada rol con su permiso real y termina siempre con un error que
-- trae los resultados; ese error deshace todo lo que hizo la prueba.
-- Necesita un administrador y dos consultoras activas.
-- ============================================

do $$
declare
    r            jsonb := '[]';
    v_consultora uuid;
    v_otra       uuid;
    v_admin      uuid;
    v_id         uuid;
    v_contacto   uuid;
    n            int;
    v_rol        text;
    v_estado     text;
    v_regla      text;
begin
    select id into v_consultora from public.perfiles where rol = 'consultora' and activo order by creado_en limit 1;
    select id into v_otra from public.perfiles where rol = 'consultora' and activo order by creado_en limit 1 offset 1;
    select id into v_admin from public.perfiles where rol = 'administrador' and activo limit 1;

    -- ---- Como consultora activa ----
    perform set_config('request.jwt.claims', json_build_object('sub', v_consultora, 'role', 'authenticated')::text, true);
    set local role authenticated;

    -- BD01 (HU08)
    insert into public.interesados (nombre, telefono, correo, medio_contacto, creado_por)
    values ('Prueba BD', '+51 900 000 123', 'prueba.bd@ejemplo.pe', 'llamada', v_consultora)
    returning id into v_id;
    r := r || jsonb_build_object('caso', 'BD01', 'obtenido', 'registrado');

    -- BD02 (HU08)
    begin
        insert into public.interesados (nombre, ruc, telefono, medio_contacto) values ('Prueba BD', '2012345678', '900000124', 'llamada');
        r := r || jsonb_build_object('caso', 'BD02', 'obtenido', 'registrado');
    exception when others then
        get stacked diagnostics v_regla = constraint_name;
        r := r || jsonb_build_object('caso', 'BD02', 'obtenido', 'rechazado: ' || v_regla);
    end;

    -- BD03 (HU08)
    begin
        insert into public.interesados (nombre, medio_contacto) values ('Prueba BD', 'llamada');
        r := r || jsonb_build_object('caso', 'BD03', 'obtenido', 'registrado');
    exception when others then
        get stacked diagnostics v_regla = constraint_name;
        r := r || jsonb_build_object('caso', 'BD03', 'obtenido', 'rechazado: ' || v_regla);
    end;

    -- BD04 a BD07 (HU12): el mismo dato escrito de otra forma, otro número y un número corto.
    select count(*) into n from public.buscar_duplicados('900-000-123', '');
    r := r || jsonb_build_object('caso', 'BD04', 'obtenido', n || ' coincidencia(s)');
    select count(*) into n from public.buscar_duplicados('', ' PRUEBA.BD@EJEMPLO.PE ');
    r := r || jsonb_build_object('caso', 'BD05', 'obtenido', n || ' coincidencia(s)');
    select count(*) into n from public.buscar_duplicados('900000999', 'otro.bd@ejemplo.pe');
    r := r || jsonb_build_object('caso', 'BD06', 'obtenido', n || ' coincidencia(s)');
    select count(*) into n from public.buscar_duplicados('123', '');
    r := r || jsonb_build_object('caso', 'BD07', 'obtenido', n || ' coincidencia(s)');

    -- BD08 (HU10)
    insert into public.interacciones (interesado_id, tipo, detalle, usuario_id)
    values (v_id, 'llamada', 'Prueba BD', v_consultora)
    returning id into v_contacto;
    r := r || jsonb_build_object('caso', 'BD08', 'obtenido', 'registrado');

    -- BD09 (HU10): anotar un contacto a nombre de otra persona.
    begin
        insert into public.interacciones (interesado_id, tipo, detalle, usuario_id) values (v_id, 'llamada', 'Prueba BD', v_otra);
        r := r || jsonb_build_object('caso', 'BD09', 'obtenido', 'registrado');
    exception when others then
        get stacked diagnostics v_estado = returned_sqlstate;
        r := r || jsonb_build_object('caso', 'BD09', 'obtenido', 'rechazado: ' || v_estado);
    end;

    -- BD10 (HU06)
    delete from public.interesados where id = v_id;
    get diagnostics n = row_count;
    r := r || jsonb_build_object('caso', 'BD10', 'obtenido', n || ' fila(s) eliminada(s)');

    -- BD11 (HU06): darse a sí misma el rol de administrador.
    update public.perfiles set rol = 'administrador' where id = v_consultora;
    get diagnostics n = row_count;
    select rol into v_rol from public.perfiles where id = v_consultora;
    r := r || jsonb_build_object('caso', 'BD11', 'obtenido', n || ' fila(s) cambiada(s), rol ' || v_rol);

    -- BD12 (HU07)
    begin
        select count(*) into n from public.listar_usuarios();
        r := r || jsonb_build_object('caso', 'BD12', 'obtenido', n || ' usuario(s) listados');
    exception when others then
        get stacked diagnostics v_estado = returned_sqlstate;
        r := r || jsonb_build_object('caso', 'BD12', 'obtenido', 'rechazado: ' || v_estado);
    end;

    -- ---- Como otra consultora ----
    reset role;
    perform set_config('request.jwt.claims', json_build_object('sub', v_otra, 'role', 'authenticated')::text, true);
    set local role authenticated;

    -- BD13 (HU10): borrar el contacto que anotó su compañera.
    delete from public.interacciones where id = v_contacto;
    get diagnostics n = row_count;
    r := r || jsonb_build_object('caso', 'BD13', 'obtenido', n || ' fila(s) eliminada(s)');

    -- ---- Como administrador ----
    reset role;
    perform set_config('request.jwt.claims', json_build_object('sub', v_admin, 'role', 'authenticated')::text, true);
    set local role authenticated;

    -- BD14 (HU07)
    select count(*) into n from public.listar_usuarios();
    r := r || jsonb_build_object('caso', 'BD14', 'obtenido', case when n > 0 then 'lista los usuarios' else 'lista vacía' end);

    -- BD15 (HU06)
    delete from public.interesados where id = v_id;
    get diagnostics n = row_count;
    r := r || jsonb_build_object('caso', 'BD15', 'obtenido', n || ' fila(s) eliminada(s)');

    -- ---- Como usuaria desactivada (HU07) ----
    reset role;
    update public.perfiles set activo = false where id = v_otra;
    perform set_config('request.jwt.claims', json_build_object('sub', v_otra, 'role', 'authenticated')::text, true);
    set local role authenticated;

    -- BD16
    select count(*) into n from public.interesados;
    r := r || jsonb_build_object('caso', 'BD16', 'obtenido', n || ' interesado(s) visibles');

    -- BD17
    begin
        insert into public.interesados (nombre, telefono, medio_contacto) values ('Prueba BD', '900000125', 'llamada');
        r := r || jsonb_build_object('caso', 'BD17', 'obtenido', 'registrado');
    exception when others then
        get stacked diagnostics v_estado = returned_sqlstate;
        r := r || jsonb_build_object('caso', 'BD17', 'obtenido', 'rechazado: ' || v_estado);
    end;

    -- ---- Como visitante de la web, con la clave pública (RNF03) ----
    reset role;
    perform set_config('request.jwt.claims', '', true);
    set local role anon;

    -- BD18
    begin
        select count(*) into n from public.interesados;
        r := r || jsonb_build_object('caso', 'BD18', 'obtenido', n || ' interesado(s) visibles');
    exception when others then
        get stacked diagnostics v_estado = returned_sqlstate;
        r := r || jsonb_build_object('caso', 'BD18', 'obtenido', 'rechazado: ' || v_estado);
    end;

    -- BD19
    begin
        select count(*) into n from public.buscar_duplicados('900000123', '');
        r := r || jsonb_build_object('caso', 'BD19', 'obtenido', n || ' coincidencia(s)');
    exception when others then
        get stacked diagnostics v_estado = returned_sqlstate;
        r := r || jsonb_build_object('caso', 'BD19', 'obtenido', 'rechazado: ' || v_estado);
    end;

    -- BD20: la web no registra a nadie sin consentimiento.
    begin
        perform public.registrar_interesado_web('Prueba BD', '', '900000126', '', '', '', '', '', false, '2026-10-16');
        r := r || jsonb_build_object('caso', 'BD20', 'obtenido', 'registrado');
    exception when others then
        get stacked diagnostics v_estado = returned_sqlstate;
        r := r || jsonb_build_object('caso', 'BD20', 'obtenido', 'rechazado: ' || v_estado);
    end;

    reset role;
    raise exception 'RESULTADOS %', r;
end;
$$;
