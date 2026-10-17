-- ============================================
-- CRM EKAM - Esquema inicial (Supabase / PostgreSQL)
-- Ejecutar una sola vez en el SQL Editor de un proyecto nuevo.
-- Cubre RF07-RF21 y RNF02, RNF04.
-- ============================================

-- ---- Tipos ----
create type public.rol_usuario as enum ('administrador', 'consultora');

-- Etapas del embudo (RF14). "cerrado" = venta ganada.
create type public.etapa_embudo as enum (
    'nuevo', 'contactado', 'demo_agendada', 'cotizado', 'cerrado', 'perdido'
);

create type public.medio_contacto as enum (
    'web_formulario', 'web_asistente', 'whatsapp', 'llamada',
    'recomendacion', 'soporte', 'otro'
);

create type public.tipo_interaccion as enum (
    'llamada', 'mensaje', 'correo', 'reunion', 'observacion'
);

create type public.estado_demo as enum ('programada', 'realizada', 'cancelada');


-- ---- Usuarios del sistema (RF07, RF08) ----
-- La contraseña la guarda Supabase Auth cifrada (RNF02); aquí solo va el perfil.
create table public.perfiles (
    id        uuid primary key references auth.users (id) on delete cascade,
    nombre    text not null,
    rol       public.rol_usuario not null default 'consultora',
    activo    boolean not null default true,
    creado_en timestamptz not null default now()
);

-- Cada usuario creado en Auth recibe su perfil como consultora.
create function public.crear_perfil()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
    insert into public.perfiles (id, nombre)
    values (new.id, coalesce(new.raw_user_meta_data ->> 'nombre', new.email));
    return new;
end;
$$;

create trigger al_crear_usuario
    after insert on auth.users
    for each row execute function public.crear_perfil();

create function public.usuario_activo()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
    select exists (
        select 1 from public.perfiles
        where id = (select auth.uid()) and activo
    );
$$;

create function public.es_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
    select exists (
        select 1 from public.perfiles
        where id = (select auth.uid()) and activo and rol = 'administrador'
    );
$$;


-- ---- Catálogos ----
-- Listas cerradas: en el Excel actual "Módulo" tiene 18 variantes de texto libre.
create table public.soluciones (
    codigo text primary key,
    nombre text not null,
    activo boolean not null default true
);

create table public.sectores (
    codigo text primary key,
    nombre text not null,
    activo boolean not null default true
);

-- Mismos códigos que el <select> del formulario de la web (index.html).
insert into public.soluciones (codigo, nombre) values
    ('navasoft-erp', 'NAVASOFT ERP'),
    ('gestion-admin', 'Gestión Administrativa'),
    ('contabilidad', 'Contabilidad'),
    ('ventas', 'Ventas'),
    ('facturacion', 'Facturación Electrónica'),
    ('inventarios', 'Inventarios'),
    ('compras-logistica', 'Compras y logística'),
    ('produccion', 'Producción'),
    ('rrhh', 'Recursos Humanos'),
    ('crm', 'CRM'),
    ('bi', 'Business Intelligence'),
    ('ia', 'Inteligencia artificial'),
    ('a-medida', 'Desarrollo a medida'),
    ('hoteles-restaurantes', 'Hoteles y restaurantes'),
    ('capacitacion', 'Capacitación'),
    ('otro', 'Otro');

-- Mismos códigos que las carpetas de /sectores/ en la web.
insert into public.sectores (codigo, nombre) values
    ('agroindustria', 'Agroindustria'),
    ('comercio', 'Comercio'),
    ('construccion', 'Construcción'),
    ('educacion', 'Educación'),
    ('grifos', 'Grifos'),
    ('hoteles-restaurantes', 'Hoteles y restaurantes'),
    ('industria', 'Industria'),
    ('salud', 'Salud'),
    ('servicios', 'Servicios'),
    ('transporte', 'Transporte'),
    ('otro', 'Otro');


-- ---- Interesados (RF09, RF10, RF12, RF13) ----
create table public.interesados (
    id                 uuid primary key default gen_random_uuid(),
    nombre             text not null,
    empresa            text,
    ruc                text check (ruc is null or ruc ~ '^\d{11}$'),
    telefono           text,
    correo             text,
    sector             text references public.sectores (codigo),
    solucion           text references public.soluciones (codigo),
    medio_contacto     public.medio_contacto not null,
    plazo              text,
    necesidad          text,
    -- true cuando la oportunidad viene de una empresa que ya usa NAVASOFT
    es_cliente_actual  boolean not null default false,
    etapa              public.etapa_embudo not null default 'nuevo',
    etapa_desde        timestamptz not null default now(),
    motivo_perdida     text,
    consultora_id      uuid references public.perfiles (id),
    proximo_contacto   timestamptz,
    origen_url         text,
    creado_por         uuid references public.perfiles (id),
    creado_en          timestamptz not null default now(),
    actualizado_en     timestamptz not null default now(),
    -- Últimos 9 dígitos: "943 163 301" y "+51943163301" cuentan como el mismo número.
    telefono_normalizado text generated always as (
        right(regexp_replace(telefono, '\D', '', 'g'), 9)
    ) stored,
    constraint interesados_con_contacto
        check (telefono is not null or correo is not null),
    constraint interesados_perdido_con_motivo
        check (etapa <> 'perdido' or motivo_perdida is not null)
);

create index interesados_etapa_idx on public.interesados (etapa);
create index interesados_consultora_idx on public.interesados (consultora_id);
create index interesados_telefono_idx on public.interesados (telefono_normalizado);
create index interesados_correo_idx on public.interesados (lower(correo));
create index interesados_creado_idx on public.interesados (creado_en);

-- Coincidencias por teléfono o correo antes de registrar (RF13).
create function public.buscar_duplicados(p_telefono text, p_correo text)
returns setof public.interesados
language sql
stable
set search_path = ''
as $$
    select *
    from public.interesados
    where (
            length(regexp_replace(coalesce(p_telefono, ''), '\D', '', 'g')) >= 7
            and telefono_normalizado = right(regexp_replace(p_telefono, '\D', '', 'g'), 9)
          )
       or (
            nullif(trim(p_correo), '') is not null
            and lower(correo) = lower(trim(p_correo))
          );
$$;


-- ---- Historial de etapas ----
-- Sin este registro no se puede calcular la conversión por etapa (RF20)
-- ni el tiempo promedio de cierre (RF21).
create table public.historial_etapas (
    id              bigint generated always as identity primary key,
    interesado_id   uuid not null references public.interesados (id) on delete cascade,
    etapa_anterior  public.etapa_embudo,
    etapa_nueva     public.etapa_embudo not null,
    cambiado_por    uuid references public.perfiles (id),
    cambiado_en     timestamptz not null default now()
);

create index historial_etapas_interesado_idx on public.historial_etapas (interesado_id);

create function public.interesados_antes_de_guardar()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
    new.actualizado_en := now();
    if new.etapa is distinct from old.etapa then
        new.etapa_desde := now();
    end if;
    return new;
end;
$$;

create trigger interesados_antes_de_actualizar
    before update on public.interesados
    for each row execute function public.interesados_antes_de_guardar();

create function public.registrar_cambio_etapa()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
    if tg_op = 'INSERT' then
        insert into public.historial_etapas (interesado_id, etapa_nueva, cambiado_por)
        values (new.id, new.etapa, (select auth.uid()));
    elsif new.etapa is distinct from old.etapa then
        insert into public.historial_etapas (interesado_id, etapa_anterior, etapa_nueva, cambiado_por)
        values (new.id, old.etapa, new.etapa, (select auth.uid()));
    end if;
    return new;
end;
$$;

create trigger interesados_registrar_etapa
    after insert or update on public.interesados
    for each row execute function public.registrar_cambio_etapa();


-- ---- Historial de contactos (RF11) ----
create table public.interacciones (
    id             uuid primary key default gen_random_uuid(),
    interesado_id  uuid not null references public.interesados (id) on delete cascade,
    tipo           public.tipo_interaccion not null,
    detalle        text not null,
    fecha          timestamptz not null default now(),
    usuario_id     uuid references public.perfiles (id) default auth.uid()
);

create index interacciones_interesado_idx on public.interacciones (interesado_id, fecha desc);


-- ---- Agenda de demostraciones (RF16) ----
create table public.demostraciones (
    id             uuid primary key default gen_random_uuid(),
    interesado_id  uuid not null references public.interesados (id) on delete cascade,
    consultora_id  uuid not null references public.perfiles (id),
    inicio         timestamptz not null,
    modalidad      text not null default 'virtual' check (modalidad in ('virtual', 'presencial')),
    estado         public.estado_demo not null default 'programada',
    notas          text,
    creado_en      timestamptz not null default now()
);

create index demostraciones_inicio_idx on public.demostraciones (inicio);


-- ---- Consentimiento de tratamiento de datos (RF02, RNF04) ----
create table public.consentimientos (
    id                bigint generated always as identity primary key,
    interesado_id     uuid not null references public.interesados (id) on delete cascade,
    canal             public.medio_contacto not null,
    version_politica  text not null,
    aceptado_en       timestamptz not null default now()
);


-- ============================================
-- Permisos (RNF02)
-- "anon" no tiene acceso a ninguna tabla. El formulario web registra por la
-- función registrar_interesado_web (002_registro_web.sql) y el asistente pasa
-- por n8n, que usa la clave de servicio.
-- ============================================
revoke all on all tables in schema public from anon;
revoke execute on all functions in schema public from anon, public;

-- El proyecto se creó con "Automatically expose new tables" desactivado,
-- así que cada permiso se da aquí de forma explícita.
grant usage on schema public to anon, authenticated, service_role;

grant select, insert, update, delete on all tables in schema public to authenticated;
grant execute on function public.usuario_activo() to authenticated;
grant execute on function public.es_admin() to authenticated;
grant execute on function public.buscar_duplicados(text, text) to authenticated;

-- n8n (asistente con IA, recordatorios y notificaciones) usa la clave de servicio.
grant all on all tables in schema public to service_role;
grant all on all sequences in schema public to service_role;
grant execute on all functions in schema public to service_role;

alter table public.perfiles         enable row level security;
alter table public.soluciones       enable row level security;
alter table public.sectores         enable row level security;
alter table public.interesados      enable row level security;
alter table public.historial_etapas enable row level security;
alter table public.interacciones    enable row level security;
alter table public.demostraciones   enable row level security;
alter table public.consentimientos  enable row level security;

-- Perfiles: todos ven la lista (para asignar consultora); solo el administrador modifica.
create policy perfiles_ver on public.perfiles
    for select to authenticated using (public.usuario_activo());
create policy perfiles_editar on public.perfiles
    for update to authenticated using (public.es_admin()) with check (public.es_admin());

-- Catálogos: lectura para todos, cambios solo del administrador.
create policy soluciones_ver on public.soluciones
    for select to authenticated using (public.usuario_activo());
create policy soluciones_admin on public.soluciones
    for all to authenticated using (public.es_admin()) with check (public.es_admin());
create policy sectores_ver on public.sectores
    for select to authenticated using (public.usuario_activo());
create policy sectores_admin on public.sectores
    for all to authenticated using (public.es_admin()) with check (public.es_admin());

-- Interesados: las consultoras ven y editan todos (se cubren entre sí y así
-- funciona la alerta de duplicados); eliminar queda para el administrador.
create policy interesados_ver on public.interesados
    for select to authenticated using (public.usuario_activo());
create policy interesados_crear on public.interesados
    for insert to authenticated with check (public.usuario_activo());
create policy interesados_editar on public.interesados
    for update to authenticated using (public.usuario_activo()) with check (public.usuario_activo());
create policy interesados_eliminar on public.interesados
    for delete to authenticated using (public.es_admin());

-- Historial de etapas: solo lectura; lo escribe el trigger.
create policy historial_etapas_ver on public.historial_etapas
    for select to authenticated using (public.usuario_activo());

-- Interacciones: cada quien corrige o borra solo las suyas.
create policy interacciones_ver on public.interacciones
    for select to authenticated using (public.usuario_activo());
create policy interacciones_crear on public.interacciones
    for insert to authenticated
    with check (public.usuario_activo() and usuario_id = (select auth.uid()));
create policy interacciones_editar on public.interacciones
    for update to authenticated
    using (usuario_id = (select auth.uid()) or public.es_admin())
    with check (usuario_id = (select auth.uid()) or public.es_admin());
create policy interacciones_eliminar on public.interacciones
    for delete to authenticated
    using (usuario_id = (select auth.uid()) or public.es_admin());

create policy demostraciones_ver on public.demostraciones
    for select to authenticated using (public.usuario_activo());
create policy demostraciones_crear on public.demostraciones
    for insert to authenticated with check (public.usuario_activo());
create policy demostraciones_editar on public.demostraciones
    for update to authenticated using (public.usuario_activo()) with check (public.usuario_activo());
create policy demostraciones_eliminar on public.demostraciones
    for delete to authenticated using (public.es_admin());

create policy consentimientos_ver on public.consentimientos
    for select to authenticated using (public.usuario_activo());
-- La consultora registra el consentimiento verbal de quien llega por llamada o WhatsApp (RF09).
create policy consentimientos_crear on public.consentimientos
    for insert to authenticated with check (public.usuario_activo());

-- ============================================
-- Después de ejecutar: crear el primer usuario en Authentication > Users
-- y convertirlo en administrador desde este mismo editor:
--   update public.perfiles set rol = 'administrador' where id = '<uuid del usuario>';
-- ============================================
