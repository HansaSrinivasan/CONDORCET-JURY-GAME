def calculate_condorcet_probability(judges, verdict):
    """
    Calculate the probability of a correct decision using the Condorcet Jury Theorem.
    
    Args:
        judges: Array of judge objects with vote and probability
        verdict: The majority verdict (acquit or convict)
        
    Returns:
        Probability that the verdict is correct
    """
    if not judges:
        return 0.5
    
    # Count judges who voted for each verdict
    convict_votes = sum(1 for judge in judges if judge['vote'] == 'convict')
    acquit_votes = len(judges) - convict_votes
    
    # Get the majority group
    majority_votes = max(convict_votes, acquit_votes)
    minority_votes = len(judges) - majority_votes
    
    # Get judges who voted for the majority verdict
    majority_judges = [j for j in judges if j['vote'] == verdict]
    
    # Calculate average probability for majority judges
    if majority_judges:
        avg_majority_prob = sum(j['probability'] for j in majority_judges) / len(majority_judges)
    else:
        avg_majority_prob = 0.5
    
    # Apply Condorcet formula (simplified for demonstration)
    # For a simple version, we use the strength of the majority and their average reliability
    majority_strength = (majority_votes - minority_votes) / len(judges)
    reliability_factor = avg_majority_prob - 0.5  # How much better than random chance
    
    # Calculate final probability (ensuring it's between 0.5 and 1)
    probability = 0.5 + (reliability_factor * majority_strength) * 0.5
    
    # Ensure the result is between 0.5 and 1
    return max(0.5, min(probability, 0.99))

def calculate_average_probability(judges):
    """
    Calculate the average probability of correctness across all judges.
    
    Args:
        judges: Array of judge objects with probability
        
    Returns:
        Average probability
    """
    if not judges:
        return 0
    
    total_probability = sum(judge['probability'] for judge in judges)
    return total_probability / len(judges)

def determine_verdict(judges):
    """
    Determine the majority verdict based on judge votes.
    
    Args:
        judges: Array of judge objects with vote
        
    Returns:
        The majority verdict ("convict" or "acquit")
    """
    convict_votes = sum(1 for judge in judges if judge['vote'] == 'convict')
    acquit_votes = len(judges) - convict_votes
    
    return 'convict' if convict_votes > acquit_votes else 'acquit'