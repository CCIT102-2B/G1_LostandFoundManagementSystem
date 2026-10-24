
using API.Models;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ItemsController : ControllerBase
    {
        // Temporary in-memory storage
        private static readonly List<Item> items = new List<Item>();
        private static int nextId = 1;

        // CREATE: Add a new item
        [HttpPost]
        public ActionResult<Item> CreateItem(Item item)
        {
            item.Id = nextId++;

            items.Add(item);

            return CreatedAtAction(
                nameof(GetCreatedItem),
                new { id = item.Id },
                item
            );
        }

        // Used to provide the location of the created item
        [HttpGet("{id}")]
        public ActionResult<Item> GetCreatedItem(int id)
        {
            var item = items.FirstOrDefault(i => i.Id == id);

            if (item == null)
            {
                return NotFound();
            }

            return Ok(item);
        }
    }
}
