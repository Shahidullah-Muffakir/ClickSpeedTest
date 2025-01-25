const getGlobalRank = async (score) => {
    const rank = await Player.countDocuments({ score: { $gt: score } }) + 1;
    return rank;
  };
  
  const getTopPlayers = async () => {
    const topPlayers = await Player.find()
      .sort({ score: -1 }) // Sort by score in descending order
      .limit(100);
    return topPlayers;
  };
  
  const savePlayerScore = async (name, score) => {
    const player = new Player({ name, score });
    await player.save();
    return player;
  };
  
  export { getGlobalRank, getTopPlayers, savePlayerScore };