interface ExampleUrlsProps {
  onUrlSelect: (url: string) => void;
}

export function ExampleUrls({ onUrlSelect }: ExampleUrlsProps) {
  const exampleUrls = [
    {
      title: "Reddit API Rate Limits Discussion",
      url: "https://www.reddit.com/r/redditdev/comments/14nbw6g/updated_rate_limits_going_into_effect_over_the/",
      description: "A popular post about Reddit API changes"
    },
    {
      title: "Programming Discussion",
      url: "https://www.reddit.com/r/programming/comments/1234567/example_post/",
      description: "Example programming discussion (may not exist)"
    }
  ];

  return (
    <div className="example-urls">
      <h3>Try these example URLs:</h3>
      <div className="example-list">
        {exampleUrls.map((example, index) => (
          <div key={index} className="example-item">
            <h4>{example.title}</h4>
            <p>{example.description}</p>
            <button 
              onClick={() => onUrlSelect(example.url)}
              className="example-button"
            >
              Load this post
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
