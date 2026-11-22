# Capa de aplicación

```text
app/
├── App.tsx
├── AppRoutes.tsx
└── providers/AppProviders.tsx
```

`App.tsx` conecta el router, los providers y las rutas.
`AppProviders.tsx` reúne el contexto de tema y el de autenticación.
`AppRoutes.tsx` define qué página se muestra en cada URL y aplica permisos
según el rol del usuario.
