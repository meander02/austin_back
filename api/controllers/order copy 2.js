
require('dotenv').config();
const User = require('../models/user');
const mongoose = require("mongoose");
// const Purchase = require("../models/purchaseSchema");
// const PurchaseDetail = require("../models/purchaseDetail");
const VentaDetail = require("../models/ventaDetail");
const Venta = require("../models/ventaSchema");
const webpush = require('web-push');

const Pedido = require('../models/order');
const PedidoDetalle = require('../models/orderDetail');

"use strict";
const nodemailer = require("nodemailer");
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.USER,
    pass: process.env.PASSMAIL,
  },
});


// Configurar las claves VAPID
const vapidKeys = {
  publicKey: "BFYtOg9-LQWHmObZKXm4VIV2BImn5nBrhz4h37GQpbdj0hSBcghJG7h-wldz-fx9aTt7oaqKSS3KXhA4nXf32pY",
  privateKey: "daiRV8XPPoeSHC4nZ5Hj6yHr98saYGlysFAuEJPypa0"
};

webpush.setVapidDetails(
  'mailto:austins0271142@gmail.com',
  vapidKeys.publicKey,
  vapidKeys.privateKey
);
const generarCodigoPedido = () => {
  // Longitud deseada del código de pedido
  const longitud = 6;
  // Caracteres permitidos en el código de pedido
  const caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let codigoPedido = '';
  
  for (let i = 0; i < longitud; i++) {
    // Seleccionar un carácter aleatorio de la lista de caracteres
    const caracterAleatorio = caracteres.charAt(Math.floor(Math.random() * caracteres.length));
    // Agregar el carácter al código de pedido
    codigoPedido += caracterAleatorio;
  }
  
  return codigoPedido;
};














// exports.crearPedido = async (req, res, next) => {
//   const datosPedido = req.body;
  
//   try {
//     // Verificar si el usuario ya existe en la base de datos
//     const existingUser = await User.findOne({ email: datosPedido.correo });

//     // Si el usuario ya existe, devolver un error
//     if (existingUser) {
//       return res.status(409).json({
//         message: `El correo ${datosPedido.correo} ya está registrado`,
//       });
//     }

//     // Crear un nuevo objeto de usuario
//     const nuevoUsuario = new User({
//       _id: new mongoose.Types.ObjectId(),
//       name: datosPedido.nombre || '',
//       maternalLastname: datosPedido.apellido1 || '',
//       paternalLastname: datosPedido.apellido2 || '',
//       email: datosPedido.correo || '',
//       phone: datosPedido.telefono || '',
//       // Asignar contraseña y nombre de usuario por defecto
//       password: 'contraseñaPorDefecto',
//       status: 'INACTIVE',
//     });

//     // Guardar el nuevo usuario en la base de datos
//     await nuevoUsuario.save();

//     // Generar un código de pedido único
//     const codigoPedido = generarCodigoPedido();

//     // Crear un nuevo objeto de pedido y detalle de pedido
//     const pedido = new Pedido({
//       _id: new mongoose.Types.ObjectId(),
//       usuario: nuevoUsuario._id,
//       estadoPedido: datosPedido.estadoPedido || 'Pendiente',
//       codigoPedido: codigoPedido,
//     });

//     const detallePedido = new PedidoDetalle({
//       _id: new mongoose.Types.ObjectId(),
//       pedido: pedido._id,
//       // Asignar los campos del detalle del pedido según los datos recibidos
//       nombre: datosPedido.nombre || '',
//       cantidad: datosPedido.selectedQuantity || 0,
//       dia: new Date(datosPedido.dia),
//       hora: datosPedido.hora || '',
//       modo: datosPedido.selectedModo || '',
//       modoPersonalizado: datosPedido.modoPersonalizado || '',
//       sabor: datosPedido.selectedFlavor || '',
//       saborPersonalizado: datosPedido.saborpersonalizado || '',
//       precioTotal: datosPedido.precioTotal || 0,
//       estadoPedido: datosPedido.estadoPedido || '',
//       notasAdicionales: datosPedido.notasAdicionales || ''
//     });

//     // Guardar el detalle del pedido en la base de datos
//     await detallePedido.save();

//     // Asociar el detalle del pedido al pedido principal
//     pedido.detallePedido.push(detallePedido);

//     // Guardar el pedido en la base de datos
//     await pedido.save();

//     // Si tienes implementado el sistema de notificaciones push, aquí podrías enviar una notificación al usuario

//     res.status(201).json({
//       message: "Pedido de pastelería creado con éxito",
//       pedido: pedido
//     });
//   } catch (error) {
//     // En caso de que ocurra un error, manejarlo adecuadamente y enviar una respuesta al cliente
//     res.status(500).json({
//       error: error.message
//     });
//   }
// };

exports.crearPedido = async (req, res, next) => {
  const datosPedido = req.body;
  
  try {
    // Verificar si el usuario ya existe en la base de datos
    const existingUser = await User.findOne({ email: datosPedido.correo });

    // Si el usuario ya existe, enviar mensaje de activación de cuenta
    if (existingUser) {
      return res.status(409).json({
        message: `El correo ${datosPedido.correo} ya está registrado. Por favor, active su cuenta para hacer el pedido.`,
      });
    }

    // Crear un nuevo objeto de usuario
    const nuevoUsuario = new User({
      _id: new mongoose.Types.ObjectId(),
      name: datosPedido.nombre || '',
      maternalLastname: datosPedido.apellido1 || '',
      paternalLastname: datosPedido.apellido2 || '',
      email: datosPedido.correo || '',
      phone: datosPedido.telefono || '',
      // Asignar contraseña y nombre de usuario por defecto
      password: 'contraseñaPorDefecto',
      status: 'INACTIVE',
    });

    // Guardar el nuevo usuario en la base de datos
    await nuevoUsuario.save();

    // Generar un código de pedido único
    const codigoPedido = generarCodigoPedido();

    // Crear un nuevo objeto de pedido y detalle de pedido
    const pedido = new Pedido({
      _id: new mongoose.Types.ObjectId(),
      usuario: nuevoUsuario._id,
      estadoPedido: datosPedido.estadoPedido || 'Pendiente',
      codigoPedido: codigoPedido,
    });

    const detallePedido = new PedidoDetalle({
      _id: new mongoose.Types.ObjectId(),
      pedido: pedido._id,
      // Asignar los campos del detalle del pedido según los datos recibidos
      nombre: datosPedido.nombre || '',
      cantidad: datosPedido.selectedQuantity || 0,
      dia: new Date(datosPedido.dia),
      hora: datosPedido.hora || '',
      modo: datosPedido.selectedModo || '',
      modoPersonalizado: datosPedido.modoPersonalizado || '',
      sabor: datosPedido.selectedFlavor || '',
      saborPersonalizado: datosPedido.saborpersonalizado || '',
      precioTotal: datosPedido.precioTotal || 0,
      estadoPedido: datosPedido.estadoPedido || '',
      notasAdicionales: datosPedido.notasAdicionales || ''
    });

    // Guardar el detalle del pedido en la base de datos
    await detallePedido.save();

    // Asociar el detalle del pedido al pedido principal
    pedido.detallePedido.push(detallePedido);

    // Guardar el pedido en la base de datos
    await pedido.save();

    // Enviar notificación por correo y mensaje de notificación si es la primera vez del usuario
    if (!existingUser) {
      // Enviar correo de seguimiento de pedido
      await enviarCorreoSeguimientoPedido(datosPedido.correo);

      // Si tienes implementado el sistema de notificaciones push, aquí podrías enviar una notificación al usuario
      await enviarNotificacionPush(datosPedido.correo, 'Su pedido está en proceso', 'Pronto nos pondremos en contacto con usted.');

      // Marcar al usuario como activo
      nuevoUsuario.status = 'ACTIVE';
      await nuevoUsuario.save();
    }

    res.status(201).json({
      message: "Pedido de pastelería creado con éxito",
      pedido: pedido
    });
  } catch (error) {
    // En caso de que ocurra un error, manejarlo adecuadamente y enviar una respuesta al cliente
    res.status(500).json({
      error: error.message
    });
  }
};




exports.updateStatusOrder = async (req, res, next) => {
  try {
    // const paypalOrderId = req.body.paypalOrderId;
    const { subscription, paypalOrderId } = req.body;
    // const { email, subscription } = req.body;

    const venta = await Venta.findOne({ paypalOrderID: paypalOrderId });
    if (!venta) {
      return res.status(404).json({ message: 'Pedido no encontrado' });
    }

    const ventaDetailId = venta.details[0];
    const ventaDetail = await VentaDetail.findById(ventaDetailId);
    if (!ventaDetail) {
      return res.status(404).json({ message: 'Detalle de compra no encontrado' });
    }
    // Verificar si el estado de la compra ya es "PAID"
    if (ventaDetail.status === 'PAID') {
      return res.status(200).json({ message: 'La compra ya está pagada, no se requieren notificaciones adicionales' });
    }
    // if (!subscription || !subscription.endpoint || !subscription.keys) {
    //   return res.status(400).json({ error: 'La suscripción no es válida.' });
    // }
    if (!subscription || !subscription.endpoint || !subscription.keys) {
      return res.status(400).json({ error: 'La suscripción no es válida.' });
    }

    // Accediendo al usuario asociado al pedido
    const user = await User.findById(venta.user);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    const userEmail = user.email;
    const userName = user.name;
    console.log(userEmail, userName)
    ventaDetail.status = 'PAID';

    const payload = {
      notification: {
        title: 'Seguimiento de Pedido',
        body: `Número de seguimiento: ${paypalOrderId}`,
        icon: "https://static.wixstatic.com/media/64de7c_4d76bd81efd44bb4a32757eadf78d898~mv2_d_1765_2028_s_2.png",
        vibrate: [200, 100, 200],
        sound: 'https://res.cloudinary.com/dfd0b4jhf/video/upload/v1710830978/sound/kjiefuwbjnx72kg7ouhb.mp3',
        priority: 'high',
      }
    };

    // Envío de notificación push
    webpush.sendNotification(subscription, JSON.stringify(payload))
      .then(() => {
        console.log('Notificación enviada con éxito');
      })
      .catch(err => {
        console.error('Error al enviar notificación:', err);
      });
    console.log(userEmail, userName)


    const mailOptionsSeguimiento = {
      from: '"Pastelería Austin\'s" <austins0271142@gmail.com>',
      to: userEmail,
      subject: 'Seguimiento de tu Pedido - Pastelería Austin\'s',
      html: `
        <div style="background-color: #f5f5f5; padding: 20px; font-family: 'Arial', sans-serif;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 10px; box-shadow: 0px 0px 10px 0px rgba(0, 0, 0, 0.1);">
            <div style="text-align: center; padding: 20px;">
              <img src="https://static.wixstatic.com/media/64de7c_4d76bd81efd44bb4a32757eadf78d898~mv2_d_1765_2028_s_2.png" alt="Austin's Logo" style="max-width: 100px;">
            </div>
            <div style="text-align: center; padding: 20px;">
              <h2 style="font-size: 24px; color: #333;">¡Gracias por tu compra en Pastelería Austin's!</h2>
              <p style="color: #555; font-size: 16px;">Tu pedido ha sido procesado con éxito y pronto estará en camino. A continuación, te proporcionamos el número de seguimiento de tu pedido y las instrucciones para consultar su estado:</p>
              <p style="font-weight: bold; font-size: 16px;">Número de Seguimiento: ${paypalOrderId}</p>
              <p style="color: #555; font-size: 16px;">Instrucciones para consultar el estado del pedido:</p>
              <ol style="color: #555; font-size: 16px;">
                <li>Ingresa a nuestro sitio web.</li>
                <li>Ve a la sección de "Seguimiento de Pedidos" o "Mis Pedidos".</li>
                <li>Ingresa el número de seguimiento proporcionado arriba.</li>
                <li>Consulta el estado actualizado de tu pedido.</li>
              </ol>
            </div>
            <p style="text-align: center; color: #777; font-size: 14px;">¡Esperamos que disfrutes de tu compra! Si tienes alguna pregunta o necesitas asistencia adicional, no dudes en ponerte en contacto con nuestro equipo de soporte.</p>
          </div>
        </div>
      `,
    };
    // Envío de correo electrónico
    const mailOptionsInvitacion = {
      from: '"Pastelería Austin\'s" <austins0271142@gmail.com>',
      to: userEmail,
      subject: '¡Únete a Pastelería Austin\'s y disfruta de beneficios exclusivos!',
      html: `
      <div style="background-color: #f5f5f5; padding: 20px; font-family: 'Arial', sans-serif;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 10px; box-shadow: 0px 0px 10px 0px rgba(0, 0, 0, 0.1);">
          <div style="text-align: center; padding: 20px;">
            <img src="https://static.wixstatic.com/media/64de7c_4d76bd81efd44bb4a32757eadf78d898~mv2_d_1765_2028_s_2.png" alt="Austin's Logo" style="max-width: 100px;">
          </div>
          <div style="text-align: center; padding: 20px;">
            <h2 style="font-size: 24px; color: #333;">¡Únete a Pastelería Austin's y disfruta de beneficios exclusivos!</h2>
            <p style="color: #555; font-size: 16px;">Gracias por elegirnos para tus compras en línea. Para ofrecerte una experiencia aún mejor, te invitamos a activar tu cuenta y disfrutar de los siguientes beneficios:</p>
            <ul style="color: #555; font-size: 16px;">
              <li>Acceso rápido y fácil a tu historial de pedidos.</li>
              <li>Seguimiento en tiempo real de tus pedidos.</li>
              <li>Ofertas especiales y descuentos personalizados.</li>
              <li>Gestión sencilla de tus direcciones de envío y métodos de pago.</li>
            </ul>
            <p style="color: #555; font-size: 16px;">Regístrate ahora y aprovecha al máximo tus compras en línea con nosotros. ¡Es rápido, fácil y gratuito!</p>
            <a  style="display: inline-block; padding: 10px 20px; background-color: #ff5733; color: #fff; text-decoration: none; border-radius: 5px;">Activar cuenta</a>
          </div>
          <p style="text-align: center; color: #777; font-size: 14px;">Si prefieres no activar tu cuenta en este momento, puedes ignorar este mensaje.</p>
        </div>
      </div>
    `,
    };



    // await transporter.sendMail(mailOptionsInvitacion);

    transporter.sendMail(mailOptionsSeguimiento, (error, info) => {
      if (error) {
        console.error('Error al enviar correo electrónico:', error);
      } else {
        console.log('Correo electrónico enviado con éxito:', info.response);
      }
    });
    // Verificar si el usuario es un invitado (GUEST)
    if (user.rol === 'GUEST') {
      transporter.sendMail(mailOptionsInvitacion, (error, info) => {
        if (error) {
          console.error('Error al enviar correo electrónico:', error);
        } else {
          console.log('Correo electrónico enviado con éxito:', info.response);
        }
      });
    } else {
      console.log('El usuario es un invitado, no se enviará el correo de invitación.');
      // Envío del correo de invitación solo si el usuario no es un invitado

    }
    // transporter.sendMail(mailOptionsInvitacion, (error, info) => {
    //   if (error) {
    //     console.error('Error al enviar correo electrónico:', error);
    //   } else { 
    //     console.log('Correo electrónico enviado con éxito:', info.response);
    //   }
    // });

    await ventaDetail.save();
    res.status(200).json({ message: 'Estado del detalle de compra actualizado correctamente' });
  } catch (error) {
    console.error('Error al actualizar el estado del detalle de compra:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};
