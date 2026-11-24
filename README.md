# SOCIALPAT · IPNA-CSIC

Web de Ciencias Sociales, Patrimonio y Alimentación. Esta copia se puede consultar y editar en un navegador. Fecha de la primera selección bibliográfica y del directorio: 22 de noviembre de 2026.

## Abrir en el ordenador

Extrae todo el ZIP en una carpeta y abre `index.html` con Chrome, Firefox, Safari o Edge. Las fotografías, las fuentes y el catálogo están incluidos. Los enlaces a artículos y fuentes institucionales necesitan conexión.

## Añadir una publicación

1. Abre **Edición del catálogo**, al pie de cualquier página.
2. Elige **Publicaciones** y **Crear una publicación**. También puedes seleccionar un registro existente.
3. Escribe el título, la autoría completa (en el orden de publicación), el año, la revista o editorial y el DOI o enlace. Marca las personas firmantes de SOCIALPAT. Para vincular el trabajo a un proyecto, selecciónalo y añade, cuando esté disponible, el enlace a la acreditación.
4. Pulsa **Guardar publicación en esta copia**. El registro se verá en el listado general y en las fichas vinculadas.
5. Pulsa **Descargar catálogo actualizado** y sustituye `datos/socialpat.js` en la carpeta descomprimida. Abre de nuevo `index.html` para ver la versión guardada.

## Añadir o actualizar un proyecto

En **Edición del catálogo → Proyectos**, selecciona una ficha o **Crear un proyecto**. Puedes editar el título, los responsables, las fechas y la financiación, cargar el logotipo del proyecto, añadir entidades del consorcio con su función y logotipo y marcar sus publicaciones. Para enlazar una ficha personal, utiliza el nombre que aparece en **Equipo**. Los cambios en el equipo de un proyecto se reflejan también en las fichas de sus integrantes.

Los logotipos cargados quedan incluidos en el catálogo descargado. Guarda la ficha y descarga el catálogo antes de cerrar la pestaña. Para corregir biografías y retratos, edita los registros de `members` en `datos/socialpat.js` y los archivos de `assets/people/`.

## Trabajo compartido

Empieza cada edición con la última copia del catálogo. El formulario modifica la copia abierta en el navegador. Quien tenga permiso de escritura en el repositorio puede incorporar el archivo actualizado. Si dos personas están editando al mismo tiempo, revisad los cambios de ambas antes de reemplazar el archivo.

## Preparar GitHub Pages cuando se decida publicar

1. Sube el contenido descomprimido al repositorio. `index.html`, `.nojekyll`, `assets/` y `datos/` deben quedar en la raíz de la rama elegida.
2. En **Settings → Pages → Build and deployment**, elige **Deploy from a branch**. Selecciona la rama (por ejemplo, `main`) y **/(root)**.
3. Guarda y espera a que GitHub complete el despliegue. Los cambios posteriores en la rama de publicación actualizarán la web.

[Documentación de GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)

## Fuentes

El apartado **Fuentes y créditos** documenta las imágenes y la procedencia de los datos. Cada perfil, proyecto y referencia enlaza con sus fuentes. Las obras seleccionadas recogen la trayectoria científica de las personas del directorio. La vinculación a un proyecto se documenta por separado.

La portada de La Geria es de Tamara Kulikova y se distribuye bajo [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/). La copia WebP se ha redimensionado y el encuadre se adapta a la pantalla. Los archivos de licencia de DM Sans e Instrument Serif están en `assets/fonts/`. Los retratos y materiales institucionales llevan sus enlaces de procedencia en la web.
