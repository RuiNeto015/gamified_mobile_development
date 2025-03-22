package isep.labdsof.ecoloop.model.avatar;

import lombok.Data;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.Date;
import java.util.List;

@Data
@Document("asset_item_collection")
public class AssetItem {
    private String id;
    private String name;
    private String organizationId;
    private boolean locked;
    private String type;
    private String bodyType;
    private boolean editable;
    private String gender;
    private boolean hasApps;
    private List<String> campaignIds;
    private String iconUrl;
    private String hairStyle;
    private String eyebrowStyle;
    private String eyeStyle;
    private String beardStyle;
    private String glassesStyle;
    private List<String> lockedCategories;
    private boolean iconGlow;
    private Date createdAt;
    private Date updatedAt;
    private boolean isTemplate;
    private boolean removeSkin;
}