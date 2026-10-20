using System.Text.Json.Nodes;
using System.Xml.Linq;

namespace TeklaConversionLayer.Tests;

public class XmlJsonTests
{
    // Trimmed from a real GetLoads reply: weights, lengths and capacity carry their unit as an attribute.
    const string GetLoadsFixture = """
        <GetLoads>
          <Successful>1</Successful>
          <JobNumber>25-351</JobNumber>
          <Destination>
            <DestinationName>Jobsite</DestinationName>
            <Load>
              <LoadNumber>1</LoadNumber>
              <Capacity UOM="kg">19958.06428</Capacity>
              <DateShipped>2026-09-30</DateShipped>
              <AssignedQuantity>48</AssignedQuantity>
              <AssignedWeight UOM="kg">16225.87631</AssignedWeight>
              <Material>
                <MainMark>52312005</MainMark>
                <Sequence>5231</Sequence>
                <LoadedWeight UOM="kg">412.5</LoadedWeight>
                <Dimensions Metric="0">W12X26</Dimensions>
                <Length UOM="in">240.25</Length>
              </Material>
            </Load>
          </Destination>
        </GetLoads>
        """;

    [Fact]
    public void Value_with_a_unit_attribute_keeps_both_the_unit_and_the_number()
    {
        var json = XmlJson.ToJson(XElement.Parse("""<Weight UOM="kg">123.4</Weight>"""))!;

        Assert.Equal("kg", (string?)json["@UOM"]);
        Assert.Equal("123.4", (string?)json["#text"]);
    }

    [Fact]
    public void GetLoads_reply_keeps_weights_lengths_and_dimensions()
    {
        var load = XmlJson.ToJson(XElement.Parse(GetLoadsFixture))!["Destination"]!["Load"]!;
        var material = load["Material"]!;

        Assert.Equal("19958.06428", (string?)load["Capacity"]!["#text"]);
        Assert.Equal("16225.87631", (string?)load["AssignedWeight"]!["#text"]);
        Assert.Equal("kg", (string?)load["AssignedWeight"]!["@UOM"]);
        Assert.Equal("412.5", (string?)material["LoadedWeight"]!["#text"]);
        Assert.Equal("W12X26", (string?)material["Dimensions"]!["#text"]);
        Assert.Equal("0", (string?)material["Dimensions"]!["@Metric"]);
        Assert.Equal("240.25", (string?)material["Length"]!["#text"]);
        // Plain leaves are unchanged: still bare strings.
        Assert.Equal("52312005", (string?)material["MainMark"]);
    }

    [Fact]
    public void Empty_element_with_only_attributes_has_no_text_key()
    {
        var json = (JsonObject)XmlJson.ToJson(XElement.Parse("""<ShippingDestination Index="0" />"""))!;

        Assert.Equal("0", (string?)json["@Index"]);
        Assert.False(json.ContainsKey("#text"));
    }
}
