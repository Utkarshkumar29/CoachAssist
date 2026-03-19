import Lead from "../models/Lead.js"

const createLead=async(req,res)=>{
    const {
        name,
        phone,
        source,
        status,
        tags,
        nextFollowUpAt
    }=req.body
    try {
        const data={
            name,
            phone,
            source,
            status,
            tags,
            assignedTo:req.user.id,
            nextFollowUpAt
        }
        const lead =await Lead.create(data)
        res.status(201).json({message:"Lead created successfully",lead})
    } catch (error) {
        console.log(error)
        res.status(500).json({message:"Internal Server Error"})
    }
}

const getLeads=async(req,res)=>{
    const {
        status,
        tags,
        search
    }=req.query
    try {
        const query = { assignedTo: req.user.id }
        if (status) query.status = status
        if (tags) query.tags = tags
        if (search) query.$text = { $search: search }
        const leads = await Lead.find(query).sort({ createdAt: -1 })
        res.status(200).json(leads)
    } catch (error) {
        console.log(error)
        res.status(500).json({message:"Internal SErver Error"})
    }
}

const getLead=async(req,res)=>{
    const {id}=req.params
    try {
        const lead=await Lead.findById(id)
        if (!lead) return res.status(404).json({ message: 'Lead not found' })
        res.status(200).json({lead})
    } catch (error) {
        console.log(error)
        res.status(500).json({message:"Internal SErver Error"})
    }
}

const updateLead=async(req,res)=>{
    const {id}=req.params
    try {
        const lead=await Lead.findByIdAndUpdate(
            id,
            req.body,
            {new:true}
        )
        if (!lead) return res.status(404).json({ message: 'Lead not found' })
    res.status(200).json({ lead })
    } catch (error) {
        console.log(error)
        res.status(500).json({message:"Internal SErver Error"})
    }
}

const deleteLead=async(req,res)=>{
    const {id}=req.params
    try {
        const lead=await Lead.findByIdAndDelete(id)
        if (!lead) return res.status(404).json({ message: 'Lead not found' })
        res.status(200).json({message:"Lead deleted successfullly"})
    } catch (error) {
        console.log(error)
        res.status(500).json({message:"Internal SErver Error"})
    }
}

export { createLead, getLeads, getLead, updateLead, deleteLead }