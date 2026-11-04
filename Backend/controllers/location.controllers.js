import { Location } from "../models/location.model.js";

export const createLocation = async (req, res) =>{
    try{
        const {name, building, floor, room, category, description} = req.body;

        if(!name || !building || !category){
            return res.status(400).json({
                message: "Name, building and category are required"
            });
        }
        const location = await Location.create({
            name,
            building,
            floor,
            room,
            category,
            description
        });
        return res.status(201).json({
            message: "Location created successfully",
            location
        });
    }catch(err){
        return res.status(500).json({
            message: err.message
        });
    }
}

export const getAllLocations = async (req, res) => {
    try{
        const locations = await Location.find();
        return res.status(200).json({
            message: "Locations fetched successfully",
            locations
        });
    }catch(err){
        return res.status(500).json({
            message: err.message
        });
    }
}

export const updateLocation = async(req, res) => {
    try{
        const {id} = req.params;

        const location = await Location.findByIdAndUpdate(
            id,
            req.body,
            {
                new: true,
                runValidators: true
            }
        );
        if(!location){
            return res.status(404).json({
                message: "Location not found"
            });
        }
        return res.status(200).json({
            message: "Location updated successfully",
            location
        });
    }catch(err){
        return res.status(500).json({
          message: err.message
        });
    }
};

export const deleteLocation = async (req, res) =>{
    try{
        const {id} = req.params;
        const location = await Location.findByIdAndDelete(id);
        if(!location){
            return res.status(404).json({
                message: "Location not found"
            });
        }
        return res.status(200).json({
            message: "Location deleted successfully"
        });
    }catch(err){
        return res.status(500).json({
            message: err.message
        });
    }
}

export const searchLocations = async (req, res) => {
    try{
        const{ name } = req.query;
        if(!name){
            return res.status(400).json({
                message: "Location name is required"
            });
        }
        const locations = await Location.find({
            name: { $regex: name, $options: "i"}
        });
        return res.status(200).json({
            message: "Search results fetched successfully",
            locations
        });
    }catch(err){
        return res.status(500).json({
            message: err.message
        });
    }
}