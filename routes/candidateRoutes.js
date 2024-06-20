const express=require('express');
const router=express.Router();
const User=require('../models/user');
const {jwtAuthMiddleware,generateToken}=require('../jwt');
const Candidate = require('../models/candidate');

//Checking if admin or not
const checkAdminRole=async(userID)=>{
    try{
        const user=await User.findById(userID);
        if(user.role==='admin'){
            return true;
        }
    }
    catch(err){
        return false;
    }
}

//post method to add a Candidate
router.post('/', jwtAuthMiddleware, async (req, res) =>{
    try{
        //checking if admin or not (candidates can only be managed by admin)
        if(!(await checkAdminRole(req.user.id)))
            return res.status(403).json({message: 'user does not have admin role'});
        
        // Assuming the request body contains the candidate data
        const data = req.body 

        // Create a new User document using the Mongoose model
        const newCandidate = new Candidate(data);

        // Save the new user to the database
        const response = await newCandidate.save();
        console.log('data saved');
        res.status(200).json({response: response});
    }
    catch(err){
        console.log(err);
        res.status(500).json({error: 'Internal Server Error'});
    }
})



//put method to update
router.put('/:candidateID',jwtAuthMiddleware,async(req,res)=>{
    try{
        //checking if admin or not (candidates can only be managed by admin)
        if(!(await checkAdminRole(req.user.id))){
            return res.status(403).json({message:'User does not have admin role'});
        }
        const candidateID=req.params.candidateID;
        const updatedCandidateData=req.body;
        
        const response=await Candidate.findByIdAndUpdate(candidateID,updatedCandidateData,{
            new:true,
            runValidators:true,
        });

        if(!response){
            return res.status(404).json({error:'Candidate not found'});
        }
        console.log('Candidate data updated');
        res.status(200).json(response);
    }
    catch(err){
        console.log(err);
        res.status(500).json({error:'Internal Server Error'});
    }
})

//delete method to delete the candidate
router.delete('/:candidateID',jwtAuthMiddleware,async(req,res)=>{
    try{
        //checking if admin or not (candidates can only be managed by admin)
        if(!(await checkAdminRole(req.user.id))){
            return res.status(403).json({message:'User does not have admin role'});
        }
        const candidateID=req.params.candidateID;
        
        const response=await Candidate.findByIdAndDelete(candidateID);

        if(!response){
            return res.status(404).json({error:'Candidate not found'});
        }
        console.log('Candidate data deleted');
        res.status(200).json(response);
    }
    catch(err){
        console.log(err);
        res.status(500).json({error:'Internal Server Error'});
    }
})

//let's start the vote
router.post('/vote/:candidateID', jwtAuthMiddleware, async (req, res)=>{
    // admin can't vote
    // user can vote,but only one time
    candidateID = req.params.candidateID;
    userId = req.user.id;

    try{
        // Find the Candidate document with the specified candidateID
        const candidate = await Candidate.findById(candidateID);
        if(!candidate){
            return res.status(404).json({ message: 'Candidate not found' });
        }

        const user = await User.findById(userId);
        if(!user){
            return res.status(404).json({ message: 'user not found' });
        }
        if(user.role == 'admin'){
            return res.status(403).json({ message: 'admin is not allowed to vote'});
        }
        if(user.isVoted){
            return res.status(400).json({ message: 'You have already voted' });
        }

        // Update the Candidate document to record the vote
        candidate.votes.push({user: userId})
        candidate.voteCount++;
        await candidate.save();

        // update the user document
        user.isVoted = true
        await user.save();

        return res.status(200).json({ message: 'Vote recorded successfully' });
    }catch(err){
        console.log(err);
        return res.status(500).json({error: 'Internal Server Error'});
    }
});

//count the votes
router.get('/vote/count', async (req, res) => {
    try{
        // Find all candidates and sort them by voteCount in descending order
        const candidate = await Candidate.find().sort({voteCount: 'desc'});

        // Map the candidates to only return their name and voteCount
        const voteRecord = candidate.map((data)=>{
            return {
                party: data.party,
                count: data.voteCount
            }
        });

        return res.status(200).json(voteRecord);
    }catch(err){
        console.log(err);
        res.status(500).json({error: 'Internal Server Error'});
    }
});

// Get List of all candidates with only name and party fields
router.get('/', async (req, res) => {
    try {
        // Find all candidates and select only the name and party fields, excluding _id
        const candidates = await Candidate.find({}, 'name party -_id');

        // Return the list of candidates
        res.status(200).json(candidates);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


module.exports=router;