const { Room } = require('../models/index');

const fmt = (r) => ({ ...r.toJSON(), _id: r.id });

exports.getRooms = async (req, res, next) => {
  try {
    const { type, status } = req.query;
    const where = {};
    if (type) where.type = type;
    if (status) where.status = status;
    const rooms = await Room.findAll({ where, order: [['roomNumber', 'ASC']] });
    res.json(rooms.map(fmt));
  } catch (error) { next(error); }
};

exports.getRoom = async (req, res, next) => {
  try {
    const room = await Room.findByPk(req.params.id);
    if (!room) return res.status(404).json({ message: 'Room not found' });
    res.json(fmt(room));
  } catch (error) { next(error); }
};

exports.createRoom = async (req, res, next) => {
  try {
    const { roomNumber, type, floor, pricePerDay, beds } = req.body;
    const room = await Room.create({
      roomNumber, type, floor, pricePerDay,
      beds: beds || [{ bedNumber: `${roomNumber}-A`, isOccupied: false }],
    });
    res.status(201).json(fmt(room));
  } catch (error) { next(error); }
};

exports.updateRoom = async (req, res, next) => {
  try {
    const { roomNumber, type, floor, pricePerDay, status, beds } = req.body;
    const room = await Room.findByPk(req.params.id);
    if (!room) return res.status(404).json({ message: 'Room not found' });
    await room.update({
      ...(roomNumber && { roomNumber }), ...(type && { type }),
      ...(floor !== undefined && { floor }), ...(pricePerDay !== undefined && { pricePerDay }),
      ...(status && { status }), ...(beds && { beds }),
    });
    res.json(fmt(room));
  } catch (error) { next(error); }
};

exports.deleteRoom = async (req, res, next) => {
  try {
    const room = await Room.findByPk(req.params.id);
    if (!room) return res.status(404).json({ message: 'Room not found' });
    const hasOccupied = (room.beds || []).some((b) => b.isOccupied);
    if (hasOccupied) return res.status(400).json({ message: 'Cannot delete room with occupied beds' });
    await room.destroy();
    res.json({ message: 'Room deleted successfully' });
  } catch (error) { next(error); }
};

exports.getRoomStats = async (req, res, next) => {
  try {
    const rooms = await Room.findAll();
    let totalBeds = 0, occupiedBeds = 0;
    rooms.forEach((room) => {
      (room.beds || []).forEach((bed) => { totalBeds++; if (bed.isOccupied) occupiedBeds++; });
    });
    res.json({ totalRooms: rooms.length, totalBeds, occupiedBeds, availableBeds: totalBeds - occupiedBeds });
  } catch (error) { next(error); }
};
