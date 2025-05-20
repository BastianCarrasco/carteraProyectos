<template>
    <div>
        <h1>Hola Vue!</h1>
        <input v-model="mensaje" placeholder="Escribe algo..." />
        <p>Mensaje: {{ mensaje }}</p>
    </div>
</template>

<script>
export default {
    data() {
        return {
            mensaje: ''
        }
    }
}
</script>