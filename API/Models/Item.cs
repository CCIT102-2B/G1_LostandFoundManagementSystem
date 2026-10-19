namespace API.Models
{
    public class Item
    {
        public int Id { get; set; }
        public string ItemName {get; set;} ="";
        public string Description {get; set;} ="";
        public string Category {get; set;} ="";
        public string Type {get; set;} ="";
        public string Location {get; set;} ="";
        public string Status {get; set;} ="Unclaimed";
        public string PhotoUrl {get; set;} ="";
    }
}
